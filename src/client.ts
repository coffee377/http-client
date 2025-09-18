import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from './window';
import { VERSION } from './data';
import { HeaderHook, OptsHook, UriHook } from './hooks';
import { merge, mergeWith } from 'lodash-es';
import { HttpAdapter } from './http';
import { HttpInterceptor } from './http/interceptor';
import { HttpFetch } from './http/handlers';
import { HttpRequest } from './http';
import { HttpResponse } from './http';
import { GlobalHttpClientConfiguration, HttpClientOptions } from './config';

export class HttpClient {
  /***
   * 默认配置（全局配置）
   * @protected
   */
  defaultConfig: GlobalHttpClientConfiguration;

  /**
   * 实列配置
   * @protected
   */
  instanceConfig: HttpClientOptions;

  version: string = VERSION;

  hooks: {
    opts: OptsHook;
    header: HeaderHook;
    url: UriHook;
  };

  interceptors?: ReadonlyArray<HttpInterceptor>;

  private handler: HttpAdapter;

  private handlers: Map<string, HttpAdapter> = new Map();

  constructor(instanceConfig: HttpClientOptions = {}) {
    this.defaultConfig = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    this.instanceConfig = instanceConfig;
    this.hooks = {
      opts: new OptsHook(),
      header: new HeaderHook(),
      url: new UriHook(),
    };
    this.handlers.set('fetch', new HttpFetch());
    // this.handlers.set('xhr', new HttpXhrAdapter());
    this.handler = this.handlers.get('fetch');

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
  async request<R = any>(urlOrOptions: string | HttpClientOptions, options?: HttpClientOptions): Promise<R> {
    const transform: HttpClientOptions = this.transformHttpClientOptions(urlOrOptions, options);

    /* 1. opts hook */
    const opts = this.hooks.opts.call(transform);

    /* 获取当前请求的 handler */
    if (typeof opts.factory === 'string') {
      this.handler = this.handlers.get(opts.factory);
    } else if (opts.factory) {
      this.handler = opts.factory;
    }

    /* 2. headers hook */
    const headers = await this.hooks.header.promise({}, opts);

    /* 3. uri hook */
    const url = await this.hooks.url.promise(opts.url, opts);

    const req = new HttpRequest(opts.method.toUpperCase(), url, {
      body: opts.data,
      params: {},
      headers,
      responseType: opts.responseType,
      reportProgress: !!opts.download || !!opts.upload,
      withCredentials: !!opts.withCredentials,
    });

    this.handler.handle(req).subscribe((res) => {
      console.log(res);
      // res.type
    });

    const res = (await this.handler.promise(req)) as HttpResponse<any>;
    // console.log(res);
    console.debug(`
    --------------------------------------------------------
     环境：${opts.env}
     ${req.method} ${req.url}
     请求头: ${JSON.stringify(req.headers.toObject())}
     请数据: ${req.serializeBody()}
    `);
    // console.table(d);

    // console.log(`请求 => ${opts.method.toUpperCase()} ${url}`);

    // console.log(opts);
    return res.body;
  }

  get<R = any>(url: string): Promise<R>;
  get<R = any>(opts: HttpClientOptions): Promise<R>;
  get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  get<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'GET' });
  }

  post<R = any>(url: string): Promise<R>;
  post<R = any>(opts: HttpClientOptions): Promise<R>;
  post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  post<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'POST' });
  }

  put<R = any>(url: string): Promise<R>;
  put<R = any>(opts: HttpClientOptions): Promise<R>;
  put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  put<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'PUT' });
  }

  delete<R = any>(url: string): Promise<R>;
  delete<R = any>(opts: HttpClientOptions): Promise<R>;
  delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  delete<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'DELETE' });
  }

  options<R = any>(url: string): Promise<R>;
  options<R = any>(opts: HttpClientOptions): Promise<R>;
  options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  options<R = any>(urlOrOptions: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'OPTIONS' });
  }

  /**
   * 转化请求参数
   * @param urlOrOptions
   * @param options
   */
  private transformHttpClientOptions = (urlOrOptions: string | HttpClientOptions, options: HttpClientOptions = {}) => {
    if (typeof urlOrOptions === 'string') {
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
      if (key === 'prefix') {
        if (typeof objValue === 'string') {
          objValue = { default: objValue };
        }
        if (typeof srcValue === 'string') {
          srcValue = { default: srcValue };
        }
        return merge({}, objValue, srcValue);
      }
      if (key === 'env') {
        return srcValue || objValue;
      }
    };

    const result: HttpClientOptions = mergeWith(
      {},
      this.defaultConfig,
      window['__HTTP_CLIENT_CONFIG__'], // 配置文件
      this.instanceConfig,
      options,
      clientOptionsMerge,
    );
    return result;
  };
}
