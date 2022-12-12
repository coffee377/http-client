import { GlobalHttpClientConfiguration, UrlRewriteFn } from './types';
import { trimApiPrefixUrl } from './utils';
import { TOKEN_PARAM_KEY, TOKEN_STORAGE, TOKEN_STORAGE_KEY } from './token';

export declare interface Window {
  __APP_REQUEST_CONF__: GlobalHttpClientConfiguration;
}

const defaultRewriteFn: UrlRewriteFn = (url, proxy, microPrefix) => {
  return trimApiPrefixUrl(url, microPrefix);
};

export const DEFAULT_APP_REQUEST_CONFIGURATION: GlobalHttpClientConfiguration = {
  proxy: false,
  rewrite: (url, proxy, microPrefix, defaultRewrite = defaultRewriteFn) => {
    /* 默认不管是否使用代理，都去除 /api 前缀（默认 url 重写规则） */
    return defaultRewrite(url, proxy, microPrefix);
  },
  resultFormat: '$.data',
  filedInfo: {
    result: {
      success: 'success',
      code: 'code',
      message: 'message',
      data: 'data',
      total: 'total',
    },
    page: {
      total: 'total',
      count: 'count',
      pageNum: 'pageNum',
      pageSize: 'pageSize',
      records: 'records',
    },
  },
  token: {
    storage: TOKEN_STORAGE,
    storageKey: TOKEN_STORAGE_KEY,
    paramKey: TOKEN_PARAM_KEY,
  },
};
