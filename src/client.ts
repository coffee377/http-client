import { FetchRequestExecutor, RequestExecutor, XhrRequestExecutor } from "@/executors";
import { GlobalHttpClientConfiguration, HttpClientOptions } from "./config";
import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from "./window";
import { merge, mergeWith } from "lodash-es";
import { VERSION } from "./data";

export class HttpClient {
  public readonly version: string = VERSION;

  /***
   * 默认配置（全局配置）
   * @protected
   */
  public readonly defaults: GlobalHttpClientConfiguration;

  /**
   * 实列配置
   * @protected
   */
  instanceConfig: HttpClientOptions;

  private executors: Map<string, RequestExecutor> = new Map();

  constructor(instanceConfig: HttpClientOptions = {}) {
    this.defaults = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    this.instanceConfig = instanceConfig;
    this.executors.set("fetch", new FetchRequestExecutor());
    this.executors.set("xhr", new XhrRequestExecutor());
  }

  request<R = any>(url: string): Promise<R>;
  request<R = any>(options: HttpClientOptions): Promise<R>;
  request<R = any>(url: string, options: HttpClientOptions): Promise<R>;
  request<R = any>(urlOrOptions: string | HttpClientOptions, options?: HttpClientOptions): Promise<R> {
    const transform: HttpClientOptions = this.transformHttpClientOptions(urlOrOptions, options);
    let requestExecutor: RequestExecutor;
    const { executor = "fetch" } = transform;
    if (typeof executor === "function") {
      requestExecutor = executor;
    } else if (typeof executor === "string") {
      requestExecutor = this.executors.get(executor);
    }
    const { url: finalUrl, method, ...rest } = transform;

    return requestExecutor.request<R>(method, finalUrl, rest);
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
