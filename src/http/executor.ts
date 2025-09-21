import {
  catchError,
  concatMap,
  delay,
  lastValueFrom,
  ObservableInput,
  of,
  retry,
  throttleTime,
  throwError,
  timer,
} from "rxjs";
import { HttpMethod, HttpRequest } from "@/http/request";
import { HeaderHook, OptsHook, UriHook } from "@/hooks";
import { HttpEventType } from "@/http/response";
import { RequestOptions } from "@/config";
import { Observable, from } from "rxjs";

export interface RequestExecutor {
  readonly hooks: RequestHooks;
  execute<T>(method: HttpMethod, url: string, options: RequestOptions): Observable<T>;
  // promise<T>(method: HttpMethod, url: string, options: RequestOptions): Observable<T>;
}

export interface RequestHooks {
  opts: OptsHook;
  header: HeaderHook;
  url: UriHook;
}

export class FetchRequestExecutor implements RequestExecutor {
  private fetchImpl: typeof fetch;
  private readonly hooks: RequestHooks;

  constructor(fetchImpl: typeof fetch = (input, init) => globalThis.fetch(input, init)) {
    this.fetchImpl = fetchImpl;
    this.hooks = { opts: new OptsHook(), header: new HeaderHook(), url: new UriHook() };
  }

  private selector<T>(response: Response, opts: RequestOptions): ObservableInput<T> {
    const { responseType = "json" } = opts;
    switch (responseType) {
      case "text":
        return response.text();
      case "blob":
        return response.blob();
      case "arrayBuffer":
        return response.arrayBuffer();
      case "bytes":
        return response.bytes();
      default:
        return response.json();
    }
  }

  execute<T>(method: HttpMethod, url: string, options?: RequestOptions): Observable<T> {
    /* 1. opts hook */
    const opts = this.hooks.opts.call(options ?? {});

    /* 2. headers hook */
    const headers = this.hooks.header.call({}, opts);

    /* 3. uri hook */
    const input = this.hooks.url.call(url, opts);

    const selector = (response) => response.json();

    const init: RequestInit = { method: method.toUpperCase(), headers, body: opts?.data };

    const observable = new Observable<Response | T>((subscriber) => {
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

      this.fetchImpl(input, perSubscriberInit)
        .then((response) => {
          const { status, ok } = response;
          // const ok = status >= 200 && status < 300;
          // console.log(ok, status);
          if (!ok) {
            // 非正常响应，抛出错误
            handleError(new Error(`${status}`));
          }
          if (selector) {
            from(selector(response)).subscribe({
              next: (data) => {
                subscriber.next(data);
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
        })
        .catch(handleError);

      return () => {
        if (abortable) controller.abort();
      };
    });

    return of({ type: HttpEventType.Sent }).pipe(
      throttleTime(500), // 0.5 秒内只允许1次请求
      concatMap(() => observable),
      retry({
        count: 2, // 重试次数
        delay: (error, retryCount) => {
          return timer(Math.pow(2, retryCount - 1) * 5000);
        },
        resetOnSuccess: true,
      }),
    );
  }
}
