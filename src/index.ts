import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from './window';
import { GlobalHttpClientConfiguration, HttpClientOptions } from './types';
import { merge } from 'lodash-es';
import { VERSION } from './data';

export interface Window {
  __HTTP_CLIENT_CONFIG__: GlobalHttpClientConfiguration;
}

class HttpClient {
  /***
   * 默认配置
   * @protected
   */
  protected defaultConfig: HttpClientOptions;

  /**
   * 实列配置（全局配置）
   * @protected
   */
  protected instanceConfig: HttpClientOptions;

  constructor(instanceConfig: HttpClientOptions = {}) {
    this.defaultConfig = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    this.instanceConfig = instanceConfig;
  }

  getUri(opts: HttpClientOptions): string {
    let { rewrite, url } = opts;
    url = rewrite(url, opts);
    return url;
  }

  request<R = any>(url: string): Promise<R>;

  request<R = any>(options: HttpClientOptions): Promise<R>;

  request<R = any>(url: string, options: HttpClientOptions): Promise<R>;

  request<R = any>(urlOrOptions: string | HttpClientOptions, options: HttpClientOptions): Promise<R> {
    const config = this.transformHttpClientOptions(urlOrOptions, options);

    console.log(`请求 => ${config.method.toUpperCase()} ${this.getUri(config)}`);

    console.log(config);
    return null;
  }

  get<R = any>(url: string): Promise<R>;

  get<R = any>(opts: HttpClientOptions): Promise<R>;

  get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  get<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, opts);
  }

  post<R = any>(url: string): Promise<R>;

  post<R = any>(opts: HttpClientOptions): Promise<R>;

  post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  post<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, opts);
  }

  put<R = any>(url: string): Promise<R>;

  put<R = any>(opts: HttpClientOptions): Promise<R>;

  put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  put<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, opts);
  }

  delete<R = any>(url: string): Promise<R>;

  delete<R = any>(opts: HttpClientOptions): Promise<R>;

  delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  delete<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, opts);
  }

  options<R = any>(url: string): Promise<R>;

  options<R = any>(opts: HttpClientOptions): Promise<R>;

  options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  options<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, opts);
  }

  /**
   * 转化请求参数
   * @param urlOrOptions
   * @param options
   */
  private transformHttpClientOptions = (urlOrOptions: string | HttpClientOptions, options: HttpClientOptions = {}) => {
    if (typeof urlOrOptions === 'string') {
      options = options || {};
      options.url = urlOrOptions;
    } else {
      options = urlOrOptions || {};
    }
    const result: HttpClientOptions = merge({}, this.defaultConfig, options);
    result.method = result.method?.toLowerCase() || 'get';
    return result;
  };
}

export default class HttpClientStatic {
  static name: string = 'request';
  static version: string = VERSION;
  private static client: HttpClient = HttpClientStatic.create();

  static create(opts?: HttpClientOptions): HttpClient {
    return new HttpClient(opts);
  }

  static get<R = any>(url: string): Promise<R>;
  static get<R = any>(opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.get(url as any, { ...opts, method: 'GET' });
  }

  static post<R = any>(url: string): Promise<R>;
  static post<R = any>(opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.post(url as any, { ...opts, method: 'post' });
  }

  static put<R = any>(url: string): Promise<R>;
  static put<R = any>(opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.put(url as any, { ...opts, method: 'put' });
  }

  static delete<R = any>(url: string): Promise<R>;
  static delete<R = any>(opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.delete(url as any, { ...opts, method: 'DELETE' });
  }

  static options<R = any>(url: string): Promise<R>;
  static options<R = any>(opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.options(url as any, { ...opts, method: 'OPTIONS' });
  }
}

// const s = new HttpClient();
// s.request<string>('').then()
