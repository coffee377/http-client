import { AppRequestConfiguration, DEFAULT_APP_REQUEST_CONFIGURATION } from './window';
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
import { HttpRequest, RequestOptions } from './index';

export type RequestInterceptorFn = (
  options: RequestOptions,
  configuration: AppRequestConfiguration,
) => RequestInterceptor;
export type ResponseInterceptorFn = (
  options: RequestOptions,
  configuration: AppRequestConfiguration,
) => ResponseInterceptor;

/**
 * 参数转换
 * @param service
 * @param options
 * @since 0.2.5
 */
function transformParams(service: string | RequestOptions, options: RequestOptions = {}): RequestOptions {
  let opts: RequestOptions = {};
  if (arguments.length === 1 && typeof service === 'string') {
    opts.url = service;
  } else if (arguments.length === 1 && typeof service !== 'string') {
    opts = service;
  } else if (arguments.length === 2) {
    opts = Object.assign({}, options, { url: service });
  }
  return opts;
}

/**
 * 根据配置生成实际 url
 * @param opts
 * @param conf
 */
function finalUrl(opts: RequestOptions, conf: AppRequestConfiguration = DEFAULT_APP_REQUEST_CONFIGURATION): string {
  const { url, prefix } = opts;
  /* 解析完成之后删除 */
  // delete opts.url;

  const { proxy, startReplaceEmpty, rewrite } = conf;

  // if (!proxy || prefix) {
  //   /*  url 地址重写,优先级高于 startReplaceEmpty 配置 */
  //   if (rewrite) return rewrite(url);
  //
  //   // todo remove in next
  //   /* 非接口代理模式下或请求使用独立 prefix 时，则替换 url 前置指定字符串为空 */
  //   const reg = new RegExp(`^${startReplaceEmpty}`);
  //   if (startReplaceEmpty && reg.test(url)) return url.replace(reg, '');
  // }
  return rewrite(url, proxy, '');
}

/**
 * 根据配置生成实际 prefix
 * @param opts
 * @param conf
 */
function finalPrefix(opts: RequestOptions, conf: AppRequestConfiguration = DEFAULT_APP_REQUEST_CONFIGURATION): string {
  const { prefix, microPrefix } = opts;
  const { prefix: globalPrefix, env } = conf;
  // const validPath = (str: string) => slash(str).replace(/\//, '');
  //
  // /* 前缀数组 */
  // const prefixArr: string[] = [];
  if (prefix) {
    return prefix;
  } else if (typeof globalPrefix == 'string') {
    return globalPrefix;
  } else if (!!env && typeof globalPrefix == 'object') {
    return globalPrefix[env];
  }
  const first = prefix || globalPrefix;
  // if (first) {
  //   prefixArr.push(first.endsWith('/') ? first.slice(0, first.length - 1) : first);
  // }

  // if (typeof microPrefix === 'string') {
  //   prefixArr.push(validPath(microPrefix));
  // } else {
  //   const paths: string[] = ((microPrefix as string[]) || []).map((s) => slash(s).replace(/\//, '')).filter((s) => !!s);
  //   prefixArr.push(...paths);
  // }
  // /* 解析完成之后删除 */
  // delete opts.microPrefix;

  // return prefixArr.filter((p) => !!p).join('/');
  // return first
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
function resolveRequestOptionsInit(options: RequestOptions, configuration: AppRequestConfiguration = {}) {
  const requestConfiguration = Object.assign({}, DEFAULT_APP_REQUEST_CONFIGURATION, configuration);
  const { upload, download } = options;

  const requestOptionsInit: RequestOptionsInit = options;

  // 数据为 FormData 类型，删除 请求头中的 Content-Type，让浏览器自动处理
  if (isFormData(requestOptionsInit.data)) {
    delete requestOptionsInit.headers?.['Content-Type'];
  }

  // if (upload && download) throw new RequestOptionsError(`upload & download 参数不能同时为 true`);

  if (upload) requestOptionsInit.requestType = 'form';
  if (download) requestOptionsInit.responseType = 'blob';

  const url = finalUrl(options, requestConfiguration);

  const prefix = finalPrefix(options, requestConfiguration);

  if (prefix) requestOptionsInit.prefix = prefix;

  return { url, requestOptionsInit };
}

/**
 *  @description 简化请求封装
 */
interface IRequest {
  request<R>(options: RequestOptions): Promise<R>;

  // extend(options?: RequestOptions, configuration?: RequestConfiguration): IRequest;

  extendOptions(options?: RequestOptions): void;

  extendConfiguration(configuration: AppRequestConfiguration): void;

  use(handler: OnionMiddleware, options?: OnionOptions): void;

  useRequestInterceptor(handler: RequestInterceptorFn, options?: OnionOptions): void;

  useResponseInterceptor(handler: ResponseInterceptorFn, options?: OnionOptions): void;
}

/**
 * 增强请求类
 */
class RequestPlus implements IRequest {
  private readonly req: RequestMethod;
  private readonly opts: RequestOptions;
  private conf: AppRequestConfiguration;

  constructor(options: RequestOptions = {}, configuration: AppRequestConfiguration = {}) {
    this.opts = options;
    this.conf = Object.assign({}, DEFAULT_APP_REQUEST_CONFIGURATION, configuration);
    const { requestOptionsInit } = resolveRequestOptionsInit(this.opts, this.conf);
    this.req = UmiRequestExtend(requestOptionsInit);
  }

  async request<R = any>(options: RequestOptions): Promise<R> {
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

  extend(options?: RequestOptions, requestConfiguration?: AppRequestConfiguration): IRequest {
    return new RequestPlus(options, requestConfiguration);
  }

  extendOptions(options?: RequestOptions): void {
    if (options) {
      const { requestOptionsInit } = resolveRequestOptionsInit(options, this.conf);
      this.req.extendOptions(requestOptionsInit);
    }
  }

  extendConfiguration(configuration: AppRequestConfiguration): void {
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

export function extend(opts: RequestOptions = {}, conf: AppRequestConfiguration = {}): HttpRequest {
  const requestPlus = new RequestPlus(opts, conf);

  /* 1. 请求拦截处理 */
  // requestPlus.useRequestInterceptor(requestInterceptor, {});

  /* 2.请求响应处理 */

  // requestPlus.useResponseInterceptor(responseInterceptor, {});

  function plus<R>(url: string): Promise<R>;
  function plus<R>(options: RequestOptions): Promise<R>;
  function plus<R>(url: string, options: RequestOptions): Promise<R>;
  function plus<R = any>(service: string | RequestOptions, options: RequestOptions = {}): Promise<R> {
    const requestOptions = transformParams(service, options);
    return requestPlus.request<R>(requestOptions);
  }

  /* 请求语法糖  request.get request.post …… */
  const METHODS = ['get', 'post', 'put', 'delete', 'options'];
  METHODS.forEach((method) => {
    plus[method] = <R = any>(service: string | RequestOptions, options: RequestOptions = {}) => {
      const requestOptions = transformParams(service, options);
      return requestPlus.request<R>({ ...requestOptions, method });
    };
  });

  plus.extendOptions = (options?: RequestOptions) => {
    requestPlus.extendOptions(options);
  };

  plus.extendConfiguration = (configuration?: AppRequestConfiguration) => {
    requestPlus.extendConfiguration(configuration);
  };

  return plus as unknown as HttpRequest;
}

/* 默认增强后的请求类 */
const request = extend();

export default request;