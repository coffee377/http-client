import { HeaderHook, OptsHook, RequestHooks, UriHook } from "@/hooks";
import { lastValueFrom, Observable } from "rxjs";
import { RequestOptions } from "@/config";
import { HttpMethod } from "@/http";

export interface ExecutorOptions<S = any> extends RequestOptions {
  trigger?: Observable<S>;
}

export interface RequestExecutor {
  readonly hooks: RequestHooks;
  execute<R>(method: HttpMethod, url: string, options?: ExecutorOptions): Observable<R>;
  request<R>(method: HttpMethod, url: string, options?: ExecutorOptions): Promise<R>;
}

export abstract class RequestExecutorAdapter implements RequestExecutor {
  readonly hooks: RequestHooks;

  protected constructor() {
    this.hooks = {
      opts: new OptsHook(),
      header: new HeaderHook(),
      url: new UriHook(),
    };
  }

  abstract execute<R>(method: HttpMethod, url: string, options?: ExecutorOptions): Observable<R>;

  request<T>(method: HttpMethod, url: string, options?: ExecutorOptions): Promise<T> {
    const observable = this.execute<T>(method, url, options);
    return lastValueFrom(observable);
  }
}
