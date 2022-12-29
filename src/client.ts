import { HttpClientOptions } from './types';
import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from './window';
import { VERSION } from './data';
import { HeaderHook, OptsHook, PrefixHook, UriHook } from './hooks';
import { merge, mergeWith } from 'lodash-es';

export class HttpClient {
  /***
   * 默认配置
   * @protected
   */
  defaultConfig: HttpClientOptions;

  /**
   * 实列配置（全局配置）
   * @protected
   */
  instanceConfig: HttpClientOptions;

  version: string = VERSION;

  hooks: {
    opts: OptsHook;
    header: HeaderHook;
    prefix: PrefixHook;
    url: UriHook;
  };

  constructor(instanceConfig: HttpClientOptions = {}) {
    this.defaultConfig = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    this.instanceConfig = instanceConfig;
    this.hooks = {
      opts: new OptsHook(),
      header: new HeaderHook(),
      prefix: new PrefixHook(),
      url: new UriHook(),
    };
  }

  request<R = any>(url: string): Promise<R>;
  request<R = any>(options: HttpClientOptions): Promise<R>;
  request<R = any>(url: string, options: HttpClientOptions): Promise<R>;
  async request<R = any>(urlOrOptions: string | HttpClientOptions, options: HttpClientOptions): Promise<R> {
    const transform: HttpClientOptions = this.transformHttpClientOptions(urlOrOptions, options);

    /* 2. opts hook */
    const opts = this.hooks.opts.call(transform);

    /* 1. headers hook */
    const headers = await this.hooks.header.promise(null, transform);

    /* 2. prefix hook */
    const prefix = this.hooks.prefix.call('', opts);
    // console.log('请求环境 => ', opts.env);
    // console.log('请求前缀 => ', prefix);
    // this.hooks.url.callAsync(opts.url ?? '', opts,()=>{});
    /* 2. url hook */
    const url = await this.hooks.url.promise(opts.url, opts);
    // console.log(url);
    // const d = {
    //   env: opts.env,
    //   prefix,
    //   method: opts.method.toUpperCase(),
    //   // url,
    // };

    console.debug(`
    --------------------------------------------------------
     环境：${opts.env} ${prefix}
     ${opts.method.toUpperCase()} ${url}
     
     请求头
     
     请数据

    `);
    // console.table(d);

    // console.log(`请求 => ${opts.method.toUpperCase()} ${url}`);

    // console.log(opts);
    return null;
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

  put<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'PUT' });
  }

  delete<R = any>(url: string): Promise<R>;

  delete<R = any>(opts: HttpClientOptions): Promise<R>;

  delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  delete<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'DELETE' });
  }

  options<R = any>(url: string): Promise<R>;

  options<R = any>(opts: HttpClientOptions): Promise<R>;

  options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;

  options<R = any>(urlOrOptions: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.request(urlOrOptions as any, { ...opts, method: 'OPTIONS' });
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
      window['__HTTP_CLIENT_CONFIG__'],
      this.instanceConfig,
      options,
      clientOptionsMerge,
    );
    return result;
  };
}
