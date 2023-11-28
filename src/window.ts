import { TOKEN_PARAM_KEY, TOKEN_STORAGE, TOKEN_STORAGE_KEY } from './token';
import { GlobalHttpClientConfiguration } from './config';

export declare interface Window {
  __HTTP_CLIENT_CONFIG__: GlobalHttpClientConfiguration;
}

export const DEFAULT_HTTP_CLIENT_CONFIGURATION: GlobalHttpClientConfiguration = {
  env: 'default',
  factory: 'fetch',
  service: {
    auth: 'oauth',
    base: 'basic',
    oss: 'oss',
    oneself: 'test',
  },
  resultFormat: '$.data', // 已废弃，下个主要本部会废弃
  dataConversion: '$.data',
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
    multiSupport: true,
    storage: TOKEN_STORAGE,
    storageKey: TOKEN_STORAGE_KEY,
    paramKey: TOKEN_PARAM_KEY,
  },
};
