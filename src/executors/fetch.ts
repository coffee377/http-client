import {
  catchError,
  concatMap,
  iif,
  from,
  Observable,
  ObservableInput,
  of,
  throttleTime,
  throwError,
  EMPTY,
  retry,
  timer,
} from "rxjs";
import { ForbiddenError, InterfaceError, InvalidTokenError, UnauthorizedError } from "@/error";
import { ExecutorOptions, RequestExecutorAdapter } from "@/executors/types";
import { HttpEventType, HttpMethod } from "@/http";
import { RequestOptions } from "@/config";
import { dataTransform } from "@/data";

export class FetchRequestExecutor extends RequestExecutorAdapter {
  private fetchImpl: typeof fetch;

  constructor(fetchImpl: typeof fetch = (input, init) => globalThis.fetch(input, init)) {
    super();
    this.fetchImpl = fetchImpl;
  }

  execute<T>(method: HttpMethod, url: string, options?: ExecutorOptions): Observable<T> {
    const { trigger, ...requestOpts } = options ?? {};

    /* 1. opts hook */
    const opts = this.hooks.opts.call(requestOpts ?? {});

    /* 2. headers hook */
    const headers = this.hooks.header.call({}, opts);

    /* 3. uri hook */
    const input = this.hooks.url.call(url, opts);
    const init: RequestInit = { method: method.toUpperCase(), headers };

    /* 4. 执行器触发源 */
    const trigger$ = trigger ? trigger : of({ type: HttpEventType.Sent });

    return trigger$.pipe(
      throttleTime(500), // 0.5 秒内只允许1次请求
      /* 1. 发起请求 */
      concatMap(() => this.fromFetch(input, init, opts)),
      /* 2. 数据转换 */
      // concatMap(async (response: Response) => {
      //   const onProgress = (loaded: number, total?: number, progress?: number, partialText?: string) => {
      //     if (progress !== null) {
      //       console.log(`进度: ${progress.toFixed(2)}% (${loaded}/${total} 字节)`);
      //       // 实际应用中可更新UI进度条：document.getElementById('progress').style.width = `${progress}%`;
      //     } else {
      //       console.log(`已加载: ${loaded} 字节（总大小未知）`);
      //     }
      //     of({
      //       type: HttpEventType.DownloadProgress,
      //       total,
      //       loaded,
      //       partialText,
      //     } as HttpDownloadProgressEvent);
      //   };
      //
      //   if (response.body) {
      //     // Read Progress
      //     const contentLength = response.headers.get("content-length");
      //     const totalBytes = parseInt(contentLength, 10);
      //     let loadedBytes = 0; // 已加载的字节数
      //     console.log("totalBytes => ", totalBytes);
      //     let decoder: TextDecoder;
      //     let partialText: string | undefined;
      //     // 1. 创建带进度跟踪的转换流
      //     const progressTransformer = new TransformStream<Uint8Array, Uint8Array>({
      //       transform(chunk, controller) {
      //         // 累加已处理的字节数（chunk通常是Uint8Array）
      //         loadedBytes += chunk.byteLength;
      //         // partialText =
      //         //   request.responseType === "text"
      //         //     ? (partialText ?? "") + (decoder ??= new TextDecoder()).decode(chunk, { stream: true })
      //         //     : undefined;
      //         // 计算进度并回调
      //         if (totalBytes) {
      //           const progress = (loadedBytes / totalBytes) * 100;
      //           onProgress(loadedBytes, totalBytes, progress);
      //         } else {
      //           // 无总长度时，仅反馈已加载字节数
      //           onProgress(loadedBytes, null, null);
      //         }
      //
      //         // 将数据块传递到下一个流（不修改数据）
      //         controller.enqueue(chunk);
      //       },
      //       flush(controller) {
      //         // 流结束时确保最后一次进度更新
      //         onProgress(totalBytes, totalBytes, 100);
      //         controller.terminate();
      //       },
      //     });
      //
      //     // 2. 创建最终的可写流（这里示例：将数据存入ArrayBuffer）
      //     const resultBuffer: Uint8Array[] = [];
      //     let chunksAll: Uint8Array;
      //     const writeStream = new WritableStream<Uint8Array>({
      //       write(data) {
      //         resultBuffer.push(data);
      //         // 实际场景中可写入文件、更新DOM等
      //       },
      //       close() {
      //         // 拼接所有数据块为完整的ArrayBuffer
      //         const totalLength = resultBuffer.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      //         chunksAll = new Uint8Array(totalLength);
      //         let offset = 0;
      //         for (const chunk of resultBuffer) {
      //           chunksAll.set(chunk, offset);
      //           offset += chunk.byteLength;
      //         }
      //       },
      //       abort(reason) {
      //         // console.error('流被中止:', reason);
      //       },
      //     });
      //
      //     // 使用File System Access API获取可写流（保存到本地文件）
      //     // const fileHandle = await window.showSaveFilePicker({
      //     //   // suggestedName: fileName,
      //     // });
      //     // const writableStream = await fileHandle.createWritable();
      //
      //     // 4. 管道链：响应流 → 进度跟踪转换流 → 可写流
      //     const readableStream = response.body.pipeThrough(progressTransformer);
      //     readableStream.pipeTo(writeStream).then(console.log);
      //     // const res = new Response(readableStream, {});
      //     return of(readableStream);
      //   }
      //   return EMPTY;
      // }),
      // retry({
      //   count: 2, // 重试次数
      //   delay: (error, retryCount) => {
      //     return timer(Math.pow(2, retryCount - 1) * 5000);
      //   },
      //   resetOnSuccess: true,
      // }),
      // catchError((error) => {
      //   // const errorMsg = this.formatErrorMsg(error);
      //   // finalConfig.errorHandler?.(new Error(errorMsg));
      //   console.log(">>>>>", error);
      //   return throwError(() => new Error(error.toString()));
      // }),
    );
  }

  fromFetch<T = Response | any>(url: string, init: RequestInit, opts: RequestOptions): Observable<Response | T> {
    const { responseType = "json" } = opts;
    return new Observable<Response | T>((subscriber) => {
      const controller = new AbortController(); // 内部取消控制器
      const { signal } = controller; // 内部信号（传递给fetch）
      let abortable = true; // 标志：是否允许取消（避免影响后续响应处理）

      const { signal: outerSignal } = init;
      if (outerSignal) {
        if (outerSignal.aborted) {
          // 外部信号已取消：直接取消内部请求
          controller.abort();
        } else {
          // 外部信号未取消：监听其abort事件，触发时取消内部请求
          const outerSignalHandler = () => !signal.aborted && controller.abort();
          outerSignal.addEventListener("abort", outerSignalHandler);
          // 订阅销毁时移除监听（防止内存泄漏）
          subscriber.add(() => outerSignal.removeEventListener("abort", outerSignalHandler));
        }
      }

      // 为避免多订阅共享配置导致的副作用（如一个订阅取消影响所有订阅），创建独立的请求配置
      const perSubscriberInit: RequestInit = { ...init, signal };

      // 统一捕获所有错误（网络错误、selector执行错误等），并标记abortable为false：
      const handleError = (err: any) => {
        abortable = false;
        subscriber.error(err); // 转发错误给订阅者
      };

      this.fetchImpl(url, perSubscriberInit).then((response) => {
        const { status, ok, url } = response;
        const method = perSubscriberInit.method || "GET";
        if (!ok && [401, 403, 412].includes(status)) {
          switch (status) {
            case 401:
              handleError(new UnauthorizedError(url, method));
              break;
            case 403:
              handleError(new ForbiddenError(url, method));
              break;
            case 412:
              handleError(new InvalidTokenError(url, method));
              break;
          }
        }
        if (responseType == "json") {
          from(response.json()).subscribe({
            next: (result) => {
              const { filedInfo, errorMapping, dataConversion } = opts;

              const success = result[filedInfo.success];
              // 不存在成功标记字段，直接返回结果
              if (success == undefined) {
                subscriber.next(result);
                return;
              }

              // 成功响应数据处理
              if (success) {
                const data = dataTransform<T>(result, dataConversion);
                subscriber.next(data);
                return;
              }

              const code = result[filedInfo.code] ?? 0;
              let message = result[filedInfo.message] || "服务器内部错误";
              // 本地错误映射
              if (errorMapping && Object.keys(errorMapping).length) {
                // 服务端错误映射解析
                const key = Object.keys(errorMapping).find((k) => k === String(code));
                if (key) {
                  message = errorMapping[key] || message;
                  handleError(new InterfaceError(url, method, code, message));
                  return;
                }
              }
              handleError(new InterfaceError(url, method, code, message));
            },
            error: handleError,
            complete: () => {
              // complete回调：标记请求完成，禁止后续取消
              abortable = false;
              subscriber.complete();
            },
          });
        } else {
          abortable = false;
          subscriber.next(response);
          subscriber.complete();
        }
      }, handleError);

      return () => {
        if (abortable) controller.abort();
      };
    });
  }
}
