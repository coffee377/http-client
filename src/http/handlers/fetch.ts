import { Observable, Observer } from 'rxjs';

import type { HttpEvent, HttpHandler } from '../index';
import {
  HttpAdapter,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEventType,
  HttpHeaderResponse,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
} from '../index';
import type { SafeAny } from '../../types';

const XSSI_PREFIX = /^\)\]\}',?\n/;

const REQUEST_URL_HEADER = `X-Request-URL`;

/**
 * Determine an appropriate URL for the response, by checking either
 * response url or the X-Request-URL header.
 */
function getResponseUrl(response: Response): string | null {
  if (response.url) {
    return response.url;
  }
  // stored as lowercase in the map
  const xRequestUrl = REQUEST_URL_HEADER.toLocaleLowerCase();
  return response.headers.get(xRequestUrl);
}

/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `HttpFetch` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
export class HttpFetch extends HttpAdapter {
  constructor(
    // We use an arrow function to always reference the current global implementation of `fetch`.
    // This is helpful for cases when the global `fetch` implementation is modified by external code,
    // see https://github.com/angular/angular/issues/57527.
    private fetchImpl: typeof fetch = (input, init) => globalThis.fetch(input, init),
  ) {
    super();
  }

  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    return new Observable((observer) => {
      const aborter = new AbortController();
      this.doRequest(request, aborter.signal, observer).then(noop, (error) =>
        observer.error(new HttpErrorResponse({ error })),
      );
      return () => aborter.abort();
    });
  }

  /**
   * 发起请求
   * @param request
   * @param signal
   * @param observer
   * @private
   */
  private async doRequest(
    request: HttpRequest<SafeAny>,
    signal: AbortSignal,
    observer: Observer<HttpEvent<SafeAny>>,
  ): Promise<void> {
    const init = this.createRequestInit(request);
    let response: Response;

    // const responseObservable = fromFetch(request.urlWithParams);

    try {
      // console.log(request.urlWithParams);
      const fetchPromise = this.fetchImpl(request.urlWithParams, { signal, ...init });

      // Make sure Zone.js doesn't trigger false-positive unhandled promise
      // error in case the Promise is rejected synchronously. See function
      // description for additional information.
      silenceSuperfluousUnhandledPromiseRejection(fetchPromise);

      // Send the `Sent` event before awaiting the response.
      observer.next({ type: HttpEventType.Sent });

      response = await fetchPromise;
    } catch (error: SafeAny) {
      observer.error(
        new HttpErrorResponse({
          status: error.status ?? 0,
          statusText: error.statusText,
          url: request.urlWithParams,
          headers: error.headers,
          error,
        }),
      );
      return;
    }

    const headers = new HttpHeaders(response.headers);
    const statusText = response.statusText;
    const url = getResponseUrl(response) ?? request.urlWithParams;

    let status = response.status;
    let body: string | ArrayBuffer | Blob | object | null = null;

    if (request.reportProgress) {
      observer.next(new HttpHeaderResponse({ headers, status, statusText, url }));
    }

    const onProgress = (loaded: number, total?: number, progress?: number, partialText?: string) => {
      if (progress !== null) {
        console.log(`进度: ${progress.toFixed(2)}% (${loaded}/${total} 字节)`);
        // 实际应用中可更新UI进度条：document.getElementById('progress').style.width = `${progress}%`;
      } else {
        console.log(`已加载: ${loaded} 字节（总大小未知）`);
      }
      observer.next({
        type: HttpEventType.DownloadProgress,
        total,
        loaded,
        partialText,
      } as HttpDownloadProgressEvent);
    };

    if (response.body) {
      // Read Progress
      const contentLength = response.headers.get('content-length');
      const totalBytes = parseInt(contentLength, 10);
      let loadedBytes = 0; // 已加载的字节数
      console.log('totalBytes => ', totalBytes);
      let decoder: TextDecoder;
      let partialText: string | undefined;
      // 1. 创建带进度跟踪的转换流
      const progressTransformer = new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          // 累加已处理的字节数（chunk通常是Uint8Array）
          loadedBytes += chunk.byteLength;
          partialText =
            request.responseType === 'text'
              ? (partialText ?? '') + (decoder ??= new TextDecoder()).decode(chunk, { stream: true })
              : undefined;
          // 计算进度并回调
          if (totalBytes) {
            const progress = (loadedBytes / totalBytes) * 100;
            onProgress(loadedBytes, totalBytes, progress);
          } else {
            // 无总长度时，仅反馈已加载字节数
            onProgress(loadedBytes, null, null);
          }

          // 将数据块传递到下一个流（不修改数据）
          controller.enqueue(chunk);
        },
        flush(controller) {
          // 流结束时确保最后一次进度更新
          onProgress(totalBytes, totalBytes, 100);
          controller.terminate();
        },
      });

      // 2. 创建最终的可写流（这里示例：将数据存入ArrayBuffer）
      const resultBuffer: Uint8Array[] = [];
      let chunksAll: Uint8Array;
      const writeStream = new WritableStream<Uint8Array>({
        write(data) {
          resultBuffer.push(data);
          // 实际场景中可写入文件、更新DOM等
        },
        close() {
          // 拼接所有数据块为完整的ArrayBuffer
          const totalLength = resultBuffer.reduce((sum, chunk) => sum + chunk.byteLength, 0);
          chunksAll = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of resultBuffer) {
            chunksAll.set(chunk, offset);
            offset += chunk.byteLength;
          }
        },
        abort(reason) {
          // console.error('流被中止:', reason);
        },
      });

      // 4. 管道链：响应流 → 进度跟踪转换流 → 可写流
      const readableStream = await response.body.pipeThrough(progressTransformer);

      // const chunks: Uint8Array[] = [];
      // const reader = response.body.getReader();
      //
      // let receivedLength = 0;
      //
      // let decoder: TextDecoder;
      // let partialText: string | undefined;
      //
      // while (true) {
      //   const { done, value } = await reader.read();
      //
      //   if (done) {
      //     break;
      //   }
      //
      //   chunks.push(value);
      //   receivedLength += value.length;
      //
      //   if (request.reportProgress) {
      //     partialText =
      //       request.responseType === 'text'
      //         ? (partialText ?? '') + (decoder ??= new TextDecoder()).decode(value, { stream: true })
      //         : undefined;
      //
      //     observer.next({
      //       type: HttpEventType.DownloadProgress,
      //       total: contentLength ? +contentLength : undefined,
      //       loaded: receivedLength,
      //       partialText,
      //     } as HttpDownloadProgressEvent);
      //   }
      // }

      // Combine all chunks.
      //  chunksAll = this.concatChunks(chunks, receivedLength);
      try {
        const res = new Response(readableStream, {});
        // console.log(json);
        // const contentType = response.headers.get('Content-Type') ?? '';
        // body = this.parseBody(request, chunksAll, contentType);
        body = await res.json();
      } catch (error) {
        // Body loading or parsing failed
        observer.error(
          new HttpErrorResponse({
            error,
            headers: new HttpHeaders(response.headers),
            status: response.status,
            statusText: response.statusText,
            url,
          }),
        );
        return;
      }
    }

    // Same behavior as the XhrBackend
    if (status === 0) {
      status = body ? HttpStatusCode.Ok : 0;
    }

    // ok determines whether the response will be transmitted on the event or
    // error channel. Unsuccessful status codes (not 2xx) will always be errors,
    // but a successful status code can still result in an error if the user
    // asked for JSON data and the body cannot be parsed as such.
    const ok = status >= 200 && status < 300;

    if (ok) {
      observer.next(
        new HttpResponse({
          body,
          headers,
          status,
          statusText,
          url,
        }),
      );

      // The full body has been received and delivered, no further events
      // are possible. This request is complete.
      observer.complete();
    } else {
      observer.error(
        new HttpErrorResponse({
          error: body,
          headers,
          status,
          statusText,
          url,
        }),
      );
    }
  }

  private parseBody(
    request: HttpRequest<SafeAny>,
    binContent: Uint8Array,
    contentType: string,
  ): string | ArrayBuffer | Blob | object | null {
    switch (request.responseType) {
      case 'json': {
        // stripping the XSSI when present
        const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
        return text === '' ? null : (JSON.parse(text) as object);
      }
      case 'text':
        return new TextDecoder().decode(binContent);
      // case 'blob':
      //   return new Blob([binContent], { type: contentType });
      // case 'arraybuffer':
      //   return binContent.buffer;
    }
  }

  private createRequestInit(req: HttpRequest<SafeAny>): RequestInit {
    // We could share some of this logic with the XhrBackend

    const headers: Record<string, string> = {};
    const credentials: RequestCredentials | undefined = req.withCredentials ? 'include' : undefined;

    // Setting all the requested headers.
    req.headers.forEach((name, values) => (headers[name] = values.join(',')));

    // Add an Accept header if one isn't present already.
    if (!req.headers.has('Accept')) {
      headers['Accept'] = 'application/json, text/plain, */*';
    }

    // Auto-detect the Content-Type header if one isn't present already.
    if (!req.headers.has('Content-Type')) {
      const detectedType = req.detectContentTypeHeader();
      // Sometimes Content-Type detection fails.
      if (detectedType !== null) {
        headers['Content-Type'] = detectedType;
      }
    }

    return {
      body: req.serializeBody(),
      method: req.method,
      headers,
      credentials,
    };
  }

  private concatChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
    const chunksAll = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    return chunksAll;
  }
}

const noop = () => {};

/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise: Promise<unknown>) {
  promise.then(noop, noop);
}
