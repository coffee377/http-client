import {
  HttpClientOptions,
  TOKEN_PARAM_KEY,
  TOKEN_STORAGE_KEY,
  TokenOptions,
  TokenStorageKey,
  TokenType,
} from './types';
import { merge } from 'lodash-es';

export const deprecated = <T, K extends keyof T>(prop: typeof T[K], instead: typeof T[K], obj?: T) => {
  console.warn(`${prop} is deprecated, will remove in next. Please use ${instead} instead`);
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
  deprecated(opts.bearer, accessTokenType, opts);
  deprecated(opts.prefix, accessTokenType, opts);
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
  const { paramKey = TOKEN_PARAM_KEY } = opts;
  return paramKey[type];
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
  return slash(path).replace(/(^\/)|(\/$)/, '');
}

export function urlPathJoin(path?: string | string[]) {
  if (!path) return undefined;
  /* 前缀数组 */
  const arr: string[] = [];
  if (typeof path === 'string') {
    arr.push(slashTrim(path));
  } else if (Array.isArray(path)) {
    const paths: string[] = path.map((m) => slashTrim(m));
    arr.push(...paths);
  }
  const result = arr.filter((p) => !!p).join('/');
  return `/${result}`;
}

/**
 * 微服务前缀 url
 * @param url 原始 url
 * @param micro 微服务
 */
export function trimApiPrefixUrl(url: string, micro?: string | string[]) {
  /* 前缀数组 */
  const arr: string[] = [];
  /* 去除默认 /api 前缀 */
  const trimUrl = url.replace(/^\/api\/(.*)/, '$1');
  arr.push(trimUrl);

  if (typeof micro === 'string') {
    arr.push(slashTrim(micro));
  } else if (Array.isArray(micro)) {
    const paths: string[] = micro.map((m) => slashTrim(m));
    arr.push(...paths);
  }
  const result = arr.filter((p) => !!p).join('/');
  return `/${result}`;
}

/**
 * 参数转换
 * @param service
 * @param options
 */
export function transformParams(
  service: string | HttpClientOptions,
  options: HttpClientOptions = {},
): HttpClientOptions {
  let opts: HttpClientOptions = {};
  if (arguments.length === 1 && typeof service === 'string') {
    opts.url = service;
  } else if (arguments.length === 1 && typeof service !== 'string') {
    opts = service;
  } else if (arguments.length === 2) {
    opts = Object.assign({}, options, { url: service });
  }
  return opts;
}
