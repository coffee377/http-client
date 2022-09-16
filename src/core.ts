import { DEFAULT_APP_REQUEST_CONFIGURATION } from './window';
import {
  extend as UmiRequestExtend,
  OnionMiddleware,
  OnionOptions,
  RequestInterceptor,
  RequestMethod,
  RequestOptionsInit,
  RequestResponse,
  ResponseInterceptor,
} from 'umi-request';
import { formatData } from './format';
import { GlobalHttpRequestConfiguration, HttpRequest, HttpRequestOptions } from './types';
import { transformParams } from './util';

export type RequestInterceptorFn = (
  options: HttpRequestOptions,
  configuration: GlobalHttpRequestConfiguration,
) => RequestInterceptor;
export type ResponseInterceptorFn = (
  options: HttpRequestOptions,
  configuration: GlobalHttpRequestConfiguration,
) => ResponseInterceptor;

/**
 * 根据配置生成实际 url
 * @param opts
 * @param conf
 */
function finalUrl(
    opts: HttpRequestOptions,
    conf: GlobalHttpRequestConfiguration = DEFAULT_APP_REQUEST_CONFIGURATION,
): string {
  const {url, micro, microPrefix} = opts;
  let mPrefix = micro;
  if (!mPrefix) {
    mPrefix = microPrefix;
  }
  const {proxy, rewrite} = conf;
  return rewrite(url, proxy, mPrefix);
}

/**
 * 根据配置生成实际 prefix
 * @param opts
 * @param conf
 */
function finalPrefix(
    opts: HttpRequestOptions,
    conf: GlobalHttpRequestConfiguration = DEFAULT_APP_REQUEST_CONFIGURATION,
): string {
  const {prefix} = opts;
  const {prefix: globalPrefix, env} = conf;
  if (prefix) {
    return prefix;
  } else if (typeof globalPrefix == 'string') {
    return globalPrefix;
  } else if (!!env && typeof globalPrefix == 'object') {
    return globalPrefix[env];
  }
  return '';
}

function isFormData(data: any) {
  return false;
}

/**
 * 参数解析到 umi-request 原始参数
 * @param options
 * @param configuration
 * @since 0.2.5
 */
function resolveRequestOptionsInit(options: HttpRequestOptions, configuration: GlobalHttpRequestConfiguration = {}) {
  const requestConfiguration = Object.assign({}, DEFAULT_APP_REQUEST_CONFIGURATION, configuration);
  const {upload, download} = options;

  const requestOptionsInit: RequestOptionsInit = options;

  // 数据为 FormData 类型，删除 请求头中的 Content-Type，让浏览器自动处理
  if (isFormData(requestOptionsInit.data)) {
    delete requestOptionsInit.headers?.['Content-Type'];
  }

  // if (upload && download) throw new RequestOptionsError(`upload & download 参数不能同时为 true`);

  if (upload) requestOptionsInit.requestType = 'form';
  if (download) requestOptionsInit.responseType = 'blob';

  const prefix = finalPrefix(options, requestConfiguration);
  if (prefix) requestOptionsInit.prefix = prefix;

  const url = finalUrl(options, requestConfiguration);

  return {url, requestOptionsInit};
}

/**
 *  @description 简化请求封装
 */
interface IRequest {
  request<R>(options: HttpRequestOptions): Promise<R>;

  // extend(options?: RequestOptions, configuration?: RequestConfiguration): IRequest;

  extendOptions(options?: HttpRequestOptions): void;

  extendConfiguration(configuration: GlobalHttpRequestConfiguration): void;

  use(handler: OnionMiddleware, options?: OnionOptions): void;

  useRequestInterceptor(handler: RequestInterceptorFn, options?: OnionOptions): void;

  useResponseInterceptor(handler: ResponseInterceptorFn, options?: OnionOptions): void;
}

/**
 * 增强请求类
 */
class RequestPlus implements IRequest {
  private readonly req: RequestMethod;
  private readonly opts: HttpRequestOptions;
  private conf: GlobalHttpRequestConfiguration;

  constructor(options: HttpRequestOptions = {}, configuration: GlobalHttpRequestConfiguration = {}) {
    this.opts = options;
    this.conf = Object.assign({}, DEFAULT_APP_REQUEST_CONFIGURATION, configuration);
    const { requestOptionsInit } = resolveRequestOptionsInit(this.opts, this.conf);
    this.req = UmiRequestExtend(requestOptionsInit);
  }

  async request<R = any>(options: HttpRequestOptions): Promise<R> {
    const { url, requestOptionsInit } = resolveRequestOptionsInit(options, this.conf);
    const { getResponse = false, responseType = 'json' } = requestOptionsInit;
    if (!url) {
      // throw new RequestOptionsError('The url parameter cannot be empty!!!');
    }

    let result: R;
    // try {
    const res = await this.req<R>(url, requestOptionsInit);
    if (getResponse) {
      const { data, response } = res as RequestResponse<R>;
      result = data;
    } else {
      result = res as R;
    }
    // } catch (e) {
    //   /* 网络连接异常 */
    //   if (e instanceof TypeError && e.message === 'Failed to fetch') {
    //     throw new NetworkError({ url, options: requestOptionsInit });
    //   }
    // }

    /* 非 json 响应类型直接返回结果 */
    if (responseType !== 'json') return result;

    const { resultFormat = this.conf.resultFormat } = options;
    return formatData<any, R>(result, resultFormat);
  }

  extend(options?: HttpRequestOptions, requestConfiguration?: GlobalHttpRequestConfiguration): IRequest {
    return new RequestPlus(options, requestConfiguration);
  }

  extendOptions(options?: HttpRequestOptions): void {
    if (options) {
      const { requestOptionsInit } = resolveRequestOptionsInit(options, this.conf);
      this.req.extendOptions(requestOptionsInit);
    }
  }

  extendConfiguration(configuration: GlobalHttpRequestConfiguration): void {
    if (configuration) {
      this.conf = Object.assign({}, this.conf, configuration);
    }
  }

  use(handler: OnionMiddleware, options?: OnionOptions): void {
    this.req.use(handler, options);
  }

  useRequestInterceptor(handler: RequestInterceptorFn, options?: OnionOptions): void {
    this.req.interceptors.request.use(handler(this.opts, this.conf), options);
  }

  useResponseInterceptor(handler: ResponseInterceptorFn, options?: OnionOptions): void {
    this.req.interceptors.response.use(handler(this.opts, this.conf), options);
  }
}

export function extend(opts: HttpRequestOptions = {}, conf: GlobalHttpRequestConfiguration = {}): HttpRequest {
  const requestPlus = new RequestPlus(opts, conf);

  /* 1. 请求拦截处理 */
  // requestPlus.useRequestInterceptor(requestInterceptor, {});

  /* 2.请求响应处理 */

  // requestPlus.useResponseInterceptor(responseInterceptor, {});

  function plus<R>(url: string): Promise<R>;
  function plus<R>(options: HttpRequestOptions): Promise<R>;
  function plus<R>(url: string, options: HttpRequestOptions): Promise<R>;
  function plus<R = any>(service: string | HttpRequestOptions, options: HttpRequestOptions = {}): Promise<R> {
    const requestOptions = transformParams(service, options);
    return requestPlus.request<R>(requestOptions);
  }

  /* 请求语法糖  request.get request.post …… */
  const METHODS = ['get', 'post', 'put', 'delete', 'options'];
  METHODS.forEach((method) => {
    plus[method] = <R = any>(service: string | HttpRequestOptions, options: HttpRequestOptions = {}) => {
      const requestOptions = transformParams(service, options);
      return requestPlus.request<R>({ ...requestOptions, method });
    };
  });

  plus.extendOptions = (options?: HttpRequestOptions) => {
    requestPlus.extendOptions(options);
  };

  plus.extendConfiguration = (configuration?: GlobalHttpRequestConfiguration) => {
    requestPlus.extendConfiguration(configuration);
  };

  return plus as unknown as HttpRequest;
}

/* 默认增强后的请求类 */
const request = extend();

export default request;
