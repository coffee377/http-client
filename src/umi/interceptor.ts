import {Env, FiledInfo, GlobalHttpClientConfiguration, HTTP_CLIENT_KEYS, MicroServiceConfiguration} from '../types';
import {RequestOptionsInit} from 'umi-request';
import {UmiRequestOptions} from './index';
import {deprecated, getToken, getTokenParamKey} from '../utils';
import {
  ForbiddenError,
  InterfaceError,
  InvalidTokenError,
  NotFoundError,
  RequestOptionsError,
  UnauthorizedError,
} from './error';
import {merge, omit} from 'lodash-es';
import {TokenOptions} from '../token';

/**
 * 根据配置生成实际 url
 * @param urlPath
 * @param opts
 * @param conf
 */
function finalUrl(urlPath: string, opts: UmiRequestOptions, conf: GlobalHttpClientConfiguration): string {
  const { proxy, rewrite, microService: ms1 = {} } = conf;
  const { microAlias, microService: ms2 = {} } = opts;

  /* 废弃属性 */
  // ------------------------------------------------------- todo remove in next
  deprecated(opts, 'microPrefix', 'microAlias', 'UmiRequestOptions');
  let microPrefix: string | string[] = opts.microPrefix;
  // -------------------------------------------------------

  /* 微服务前缀获取 */
  if (microAlias) {
    const microService: MicroServiceConfiguration = merge(ms1, ms2);
    microPrefix = microService[microAlias];
  }

  if (rewrite) {
    return rewrite(urlPath, proxy, microPrefix);
  }
  return urlPath;
}

/**
 * 根据配置生成实际 prefix
 * @param opts 请求参数
 * @param conf 全局配置
 */
function finalPrefix(opts: UmiRequestOptions, conf: GlobalHttpClientConfiguration): string {
  const def: string = 'default';
  const { prefix: globalPrefix, env: globalEnv } = conf;
  const { prefix: localPrefix, env: localEnv, mock } = opts;

  const map: Map<string, string> = new Map<string, string>();

  /* 全局配置 */
  if (typeof globalPrefix == 'string') {
    map.set(def, globalPrefix);
  } else if (typeof globalPrefix == 'object') {
    Object.entries<string>(globalPrefix).forEach(([key, value]) => {
      map.set(key, value);
    });
  }

  /* 局部配置 */
  if (typeof localPrefix == 'string') {
    map.set(def, localPrefix);
  } else if (typeof localPrefix == 'object') {
    Object.entries<string>(localPrefix).forEach(([key, value]) => {
      map.set(key, value);
    });
  }

  let env: Env = localEnv || globalEnv;

  /* 局部使用 mock */
  if (mock) env = 'mock';

  if (!!env && map.has(env)) return map.get(env);

  return map.get(def) || '';
}

/**
 * 判断提交数据是否为 form 表单
 * @param data
 */
function isFormData(data: any) {
  return false;
}

/**
 * 合并请求头
 * @param opts 请求参数
 * @param conf 全局配置
 */
function finalHeaders(opts: UmiRequestOptions, conf: GlobalHttpClientConfiguration): HeadersInit {
  const { headers: globalHeaders, token: globalTokenOpts } = conf;
  const { headers: localHeaders, token: localTokenOpts } = opts;
  const tokenOptions: TokenOptions = merge(globalTokenOpts, localTokenOpts);
  /* 获取令牌 */
  const accessToken = getToken('access_token', tokenOptions);
  const accessTokenKey = getTokenParamKey('access_token', tokenOptions);

  const result: HeadersInit = merge(globalHeaders, { [accessTokenKey]: accessToken }, localHeaders);
  // return {
  //   ...globalHeaders,
  //   [accessTokenKey]: accessToken,
  //   ...localHeaders,
  // } as HeadersInit;
  return result;
}

/**
 * 请求拦截处理
 * @param globalConfiguration
 */
export function requestInterceptor(globalConfiguration: GlobalHttpClientConfiguration) {
  return (urlPath: string, options: UmiRequestOptions) => {
    /* 1. 实际 prefix */
    const prefix = finalPrefix(options, globalConfiguration);

    /* 2. 实际 url */
    const url = finalUrl(urlPath, options, globalConfiguration);

    /* 3. 请求头 */
    const headers = finalHeaders(options, globalConfiguration);

    /* 4. 请求参数 */
    const init = omit(options, HTTP_CLIENT_KEYS); // 剔除增强配置
    const { resultFormat, filedInfo } = options;
    const opts: RequestOptionsInit = { getResponse: true, ...init, prefix, headers };

    /* 数据为 FormData 类型，删除 请求头中的 Content-Type，让浏览器自动处理 */
    if (isFormData(opts.data)) {
      delete opts.headers?.['Content-Type'];
    }

    /* 5. 上传/下载文件简化 */
    const { upload, download } = options;
    if (upload && download) throw new RequestOptionsError(`upload & download 参数不能同时为 true`);
    if (upload) opts.requestType = 'form';
    if (download) opts.responseType = 'blob';

    /* 6. 最终返回 umi-request 参数 */
    return { url, opts };
  };
}

/**
 * @description 响应拦截
 * @param globalConfiguration
 */
function responseInterceptor(globalConfiguration: GlobalHttpClientConfiguration) {
  return async (response: Response, options: UmiRequestOptions) => {
    const { resultFormat: r1, filedInfo: f1, errorMapping } = globalConfiguration;
    const { resultFormat: r2, filedInfo: f2 } = options;

    const filed: FiledInfo = {};

    const {
      result: { success: successField, code: codeField, message: messageField },
    } = filed;

    const { responseType = 'json' } = options;
    if (responseType !== 'json') return response;

    /* 响应数据为 json 类型才会处理 */
    const result = await response.clone().json();
    const { url, status } = response;

    const { method = 'GET' } = options;

    const success = result[successField] || false;
    const code: string | number = result[codeField] || 0;
    let message: string = result[messageField] || 'ok';

    if (success) {
      return response;
    }
    if (errorMapping) {
      // 服务端错误映射解析
      const key = Object.keys(errorMapping).find((k) => k === String(code));
      if (key) {
        message = errorMapping[key] || message;
        throw new InterfaceError(url, method, code, message);
      }
    }
    if (status === 401) {
      throw new UnauthorizedError(url, method, message);
    } else if (status === 403) {
      throw new ForbiddenError(url, method, message);
    } else if (status === 404) {
      throw new NotFoundError(url, method, message);
    } else if (status === 412) {
      throw new InvalidTokenError(url, method, message);
    } else {
      throw new InterfaceError(url, method, code, message);
    }
  };
}
