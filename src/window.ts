import { GlobalHttpClientConfiguration, TOKEN_PARAM_KEY, TOKEN_STORAGE, TOKEN_STORAGE_KEY } from './types';
import { trimApiPrefixUrl } from './util';

export declare interface Window {
  __APP_REQUEST_CONF__: GlobalHttpClientConfiguration;
}

export const DEFAULT_APP_REQUEST_CONFIGURATION: GlobalHttpClientConfiguration = {
  proxy: false,
  rewrite: (url, proxy, micro) => {
    if (!proxy) {
      return trimApiPrefixUrl(url, micro);
    }
    return url;
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
