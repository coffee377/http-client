import { concatMap, filter, firstValueFrom, lastValueFrom, map, Observable, of } from "rxjs";
import { GlobalHttpClientConfiguration, HttpClientOptions } from "./config";
import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from "./window";
import { HeaderHook, OptsHook, UriHook } from "./hooks";
import { FetchRequestExecutor } from "@/http/executor";
import { HttpInterceptor } from "./http/interceptor";
import { HttpAdapter, HttpEvent } from "./http";
import { merge, mergeWith } from "lodash-es";
import { HttpFetch } from "./http/handlers";
import { VERSION } from "./data";

export class HttpClient {
  public readonly version: string = VERSION;

  /***
   * 默认配置（全局配置）
   * @protected
   */
  public defaults: GlobalHttpClientConfiguration;

  /**
   * 实列配置
   * @protected
   */
  instanceConfig: HttpClientOptions;

  hooks: {
    opts: OptsHook;
    header: HeaderHook;
    url: UriHook;
  };

  interceptors?: ReadonlyArray<HttpInterceptor>;

  private handler: HttpAdapter;

  private handlers: Map<string, HttpAdapter> = new Map();

  constructor(instanceConfig: HttpClientOptions = {}) {
    this.defaults = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    this.instanceConfig = instanceConfig;
    this.hooks = {
      opts: new OptsHook(),
      header: new HeaderHook(),
      url: new UriHook(),
    };
    this.handlers.set("fetch", new HttpFetch());
    // this.handlers.set('xhr', new HttpXhrAdapter());
    this.handler = this.handlers.get("fetch");

    if (this.interceptors) {
      // this.handler = this.interceptors.reduceRight(
      //   (previous, current) => new HttpInterceptorHandler(current, previous),
      //   this.handler,
      // );
    } else {
      // this.handler = backend;
    }
  }

  request<R = any>(url: string): Promise<R>;
  request<R = any>(options: HttpClientOptions): Promise<R>;
  request<R = any>(url: string, options: HttpClientOptions): Promise<R>;
  request<R = any>(urlOrOptions: string | HttpClientOptions, options?: HttpClientOptions): Promise<R> {
    const transform: HttpClientOptions = this.transformHttpClientOptions(urlOrOptions, options);

    const fetchExecutor = new FetchRequestExecutor();

    const { url: finalUrl, method, ...rest } = transform;
    const observable = fetchExecutor.execute(method, finalUrl, rest);
    // const subscription = observable.subscribe((res) => {
    //   console.log(res);
    // });
    // subscription.unsubscribe();

    return lastValueFrom(observable);

    // /* 1. opts hook */
    // const opts = this.hooks.opts.call(transform);
    //
    // /* 获取当前请求的 handler */
    // if (typeof opts.factory === "string") {
    //   this.handler = this.handlers.get(opts.factory);
    // } else if (opts.factory) {
    //   this.handler = opts.factory;
    // }
    //
    // /* 2. headers hook */
    // const headers = await this.hooks.header.promise({}, opts);
    //
    // /* 3. uri hook */
    // const url = await this.hooks.url.promise(opts.url, opts);
    //
    // const req = new HttpRequest(opts.method, url, {
    //   body: opts.data,
    //   params: {},
    //   headers,
    //   responseType: opts.responseType,
    //   // reportProgress: !!opts.download || !!opts.upload,
    //   withCredentials: !!opts.withCredentials,
    // });
    //
    // const events$ = of(req).pipe(concatMap((req: HttpRequest<SafeAny>) => this.handler.handle(req)));
    // const res$ = events$.pipe(filter((event: HttpEvent<SafeAny>) => event instanceof HttpResponse)) as Observable<
    //   HttpResponse<SafeAny>
    // >;
    //
    // // opts.observe = 'response';
    //
    // switch (opts["observe"]) {
    //   case "events":
    //     return (await firstValueFrom(events$)) as any;
    //   case "response":
    //     return (await firstValueFrom(res$)) as any;
    //   default:
    //     const data$ = res$.pipe(map((response) => response.body));
    //     return (await firstValueFrom(data$)) as any;
    // }

    // const res = (await this.handler.promise(req)) as HttpResponse<any>;
    // // console.log(res);
    // console.debug(`
    // --------------------------------------------------------
    //  环境：${opts.env}
    //  ${req.method} ${req.url}
    //  请求头: ${JSON.stringify(req.headers.toObject())}
    //  请数据: ${req.serializeBody()}
    // `);
    // // console.table(d);
    //
    // // console.log(`请求 => ${opts.method.toUpperCase()} ${url}`);
    //
    // // console.log(opts);
    // return res.body;
  }

  get<R = any>(url: string): Promise<R>;
  get<R = any>(opts: HttpClientOptions): Promise<R>;
  get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  get<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: "GET" });
  }

  post<R = any>(url: string): Promise<R>;
  post<R = any>(opts: HttpClientOptions): Promise<R>;
  post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  post<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: "POST" });
  }

  put<R = any>(url: string): Promise<R>;
  put<R = any>(opts: HttpClientOptions): Promise<R>;
  put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  put<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: "PUT" });
  }

  delete<R = any>(url: string): Promise<R>;
  delete<R = any>(opts: HttpClientOptions): Promise<R>;
  delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  delete<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: "DELETE" });
  }

  options<R = any>(url: string): Promise<R>;
  options<R = any>(opts: HttpClientOptions): Promise<R>;
  options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  options<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: "OPTIONS" });
  }

  /**
   * 转化请求参数
   * @param urlOrOptions
   * @param options
   */
  private transformHttpClientOptions = (urlOrOptions: string | HttpClientOptions, options: HttpClientOptions = {}) => {
    if (typeof urlOrOptions === "string") {
      // options = options || {};
      options.url = urlOrOptions;
    } else {
      options = urlOrOptions || {};
    }

    /**
     * 客户端配置合并
     * @param objValue
     * @param srcValue
     * @param key
     * @param object
     * @param source
     * @param stack
     */
    const clientOptionsMerge = (objValue: any, srcValue: any, key: string, object: object, source: object, stack) => {
      if (key === "prefix") {
        if (typeof objValue === "string") {
          objValue = { default: objValue };
        }
        if (typeof srcValue === "string") {
          srcValue = { default: srcValue };
        }
        return merge({}, objValue, srcValue);
      }
      if (key === "env") {
        return srcValue || objValue;
      }
    };

    const result: HttpClientOptions = mergeWith(
      {},
      this.defaults,
      window["__HTTP_CLIENT_CONFIG__"], // 配置文件
      this.instanceConfig,
      options,
      clientOptionsMerge,
    );
    return result;
  };
}
