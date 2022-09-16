import { GlobalHttpRequestConfiguration } from './types';
import { trimApiPrefixUrl } from './util';

declare interface Window {
  __APP_REQUEST_CONF__: GlobalHttpRequestConfiguration;
}

export const DEFAULT_APP_REQUEST_CONFIGURATION: GlobalHttpRequestConfiguration = {
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
    bearer: false,
    key: '',
    prefix: '',
    storage: 'local',
  },
};
