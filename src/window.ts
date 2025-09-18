import { TOKEN_PARAM_KEY, TOKEN_STORAGE, TOKEN_STORAGE_KEY } from './token';
import { GlobalHttpClientConfiguration } from './config';
import { ResultFieldInfo } from './types';

export declare interface Window {
  __HTTP_CLIENT_CONFIG__: GlobalHttpClientConfiguration;
}

export const DEFAULT_HTTP_CLIENT_CONFIGURATION: GlobalHttpClientConfiguration = {
  env: 'default',
  factory: 'fetch',
  services: {
    auth: 'oauth',
    base: 'basic',
    oss: 'oss',
    oneself: 'test',
  },
  dataConversion: '$.data',
  filedInfo: {
    success: 'success',
    code: 'code',
    message: 'message',
    // data: 'data',
    total: 'total',
    summary: 'summary',
  } as ResultFieldInfo,
  token: {
    multiSupport: true,
    storage: TOKEN_STORAGE,
    storageKey: TOKEN_STORAGE_KEY,
    paramKey: TOKEN_PARAM_KEY,
  },
};
