import { HttpClientOptions, PathValue } from './types';
import { TOKEN_PARAM_KEY, TOKEN_STORAGE_KEY, TokenOptions, TokenParamKey, TokenStorageKey, TokenType } from './token';
import { merge } from 'lodash-es';

export const DEPRECATED_MESSAGE = '{A} is deprecated, will remove in next. Please use {B} instead';

/**
 * 废弃提示信息
 * @param prop 废弃的属性
 * @param instead 替换的属性
 * @param objName 配置名称
 */
export const deprecatedMessage = <T = string, K extends string = string>(prop: K, instead: K, objName?: T) => {
  const obj = objName ? `${objName}.` : '';
  return DEPRECATED_MESSAGE.replace(/\{A}(.*)\{B}(.*)/, `${obj}${prop}$1${obj}${instead}$2`);
};

/**
 * 废弃
 * @param obj 配置对象实例
 * @param prop 废弃的属性
 * @param instead 替换的属性
 * @param objName 配置名称
 */
export const deprecated = <T = object, N = string, K extends string = string>(
  obj: T,
  prop: K,
  instead: K,
  objName?: N,
) => {
  if (Reflect.has(obj, prop)) {
    const message = deprecatedMessage<N, K>(prop, instead, objName);
    console.warn(message);
  }
};

/**
 * 获取令牌
 * @param type 令牌类型
 * @param opts 令牌配置
 */
export function getToken(type: TokenType = 'access_token', opts: TokenOptions = {}): string {
  const { multiSupport = false, storage = 'local', storageKey, accessTokenType } = opts;

  /* 废弃属性兼容处理 */
  // ------------------------------------------------------- todo remove in next
  deprecated('bearer', 'accessTokenType', 'TokenOptions');
  deprecated('prefix', 'accessTokenType', 'TokenOptions');
  if (opts.bearer) {
    opts.accessTokenType = 'Bearer';
  } else if (opts.prefix) {
    opts.accessTokenType = opts.prefix.trim();
  }
  // -------------------------------------------------------

  /* 令牌存储的 key */
  let tokenStorageKey: TokenStorageKey = { access_token: TOKEN_STORAGE_KEY.access_token };
  if (storageKey && typeof storageKey === 'string') {
    tokenStorageKey.access_token = storageKey;
  } else {
    tokenStorageKey = merge(TOKEN_STORAGE_KEY, storageKey);
  }
  const key = tokenStorageKey[type];

  /* 令牌存储类型 */
  const sto = storage == 'session' ? sessionStorage : localStorage;

  /* 获取令牌 */
  const token = sto.getItem(key)?.replace(/["'](.*)["']/, '$1') || '';
  if (!!token && accessTokenType) {
    return `${accessTokenType} ${token}`;
  } else if (!!token) {
    return token;
  }
  return '';
}

/**
 * 获取令牌参数 key
 * @param type 令牌类型
 * @param opts 令牌配置
 */
export function getTokenParamKey(type: TokenType = 'access_token', opts: TokenOptions = {}): string {
  const result: TokenParamKey = merge(TOKEN_PARAM_KEY, opts.paramKey ?? {});
  return result[type];
}

/**
 * 规范路径分隔符
 * @param path
 */
export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

/**
 * 去除前后路径符号
 * @param path
 */
export function slashTrim(path: string) {
  return slash(path).replace(/(^\/)|(\/$)/g, '');
}

/**
 * url 路径联合
 * @param path
 */
export function urlPathJoin(path?: string | string[]) {
  if (!path) return undefined;
  /* 前缀数组 */
  const arr: string[] = [];
  if (typeof path === 'string') {
    arr.push(slashTrim(path));
  } else {
    const paths: string[] = path.map((m) => slashTrim(m));
    arr.push(...paths);
  }
  const result = arr.filter((p) => !!p).join('/');
  return `/${result}`;
}

/**
 * 微服务前缀 url
 * @param prefix 前缀正则表达式
 * @param url 原始 url
 * @param micro 微服务
 */
export function trimPrefixUrl(prefix: RegExp, url: string, micro?: string | string[]) {
  const arr: string[] = [];
  /* 微服务前缀 */
  if (typeof micro === 'string') {
    arr.push(micro);
  } else if (Array.isArray(micro)) {
    arr.push(...micro);
  }
  /* url 去除默认 /api 前缀 */
  const trimUrl = url.replace(prefix, '$1');
  arr.push(trimUrl);
  return urlPathJoin(arr);
}

/**
 * 微服务前缀 url
 * @param url 原始 url
 * @param micro 微服务
 */
export function trimApiPrefixUrl(url: string, micro?: string | string[]) {
  return trimPrefixUrl(/^\/api\/?(.*)/, url, micro);
}

/**
 * 占位参数替换
 * @param url url 地址
 * @param paths 占位参数
 */
export function replacePlaceholderParameters(url: string, paths: PathValue | Record<string, PathValue> = {}) {
  let pathsKV: Record<string, PathValue> = {};
  const pathsKey = url.match(/(?<=\/?{)(.*?)(?=}\/?)/g) ?? [];
  if (typeof paths === 'object') {
    pathsKV = paths;
  } else if (pathsKey.length === 1) {
    pathsKV[pathsKey[0]] = paths;
  }

  for (let key of pathsKey) {
    if (!Reflect.has(pathsKV, key)) {
      // console.error(`路径参数错误，缺失参数 ${key}`);
      throw new Error(`路径参数错误，缺失参数 ${key}`);
    } else {
      url = url.replace(new RegExp(`{${key}}`), pathsKV[key].toString());
    }
  }
  return url;
}

// export function transformHttpClientOptions(url: string): HttpClientOptions;
// export function transformHttpClientOptions(opts: HttpClientOptions): HttpClientOptions;
// export function transformHttpClientOptions(url: string, opts: HttpClientOptions): HttpClientOptions;
/**
 * 参数转换
 * @param urlOrOptions
 * @param options
 */
// export function transformHttpClientOptions(
//   urlOrOptions: string | HttpClientOptions,
//   options: HttpClientOptions = {},
// ): HttpClientOptions {
//   let opts: HttpClientOptions = {};
//   if (arguments.length === 1 && typeof urlOrOptions === 'string') {
//     opts.url = urlOrOptions;
//   } else if (arguments.length === 1 && typeof urlOrOptions !== 'string') {
//     opts = urlOrOptions;
//   } else {
//     opts = merge(options, { url: urlOrOptions });
//   }
//   return opts;
// }

export const transformHttpClientOptions = (
  urlOrOptions: string | HttpClientOptions,
  options: HttpClientOptions = {},
) => {
  if (typeof urlOrOptions === 'string') {
    options = options || {};
    options.url = urlOrOptions;
  } else {
    options = urlOrOptions || {};
  }
  return options;
};
