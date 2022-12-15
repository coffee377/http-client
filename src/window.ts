import { GlobalHttpClientConfiguration, HttpClientOptions, UrlRewrite } from './types';
import { deprecated, replacePlaceholderParameters, trimPrefixUrl } from './utils';
import { TOKEN_PARAM_KEY, TOKEN_STORAGE, TOKEN_STORAGE_KEY } from './token';

export declare interface Window {
  /**
   * @deprecated
   */
  __APP_REQUEST_CONF__: GlobalHttpClientConfiguration;
  __HTTP_CLIENT_CONFIG__: GlobalHttpClientConfiguration;
}

/**
 * 默认 url 重新规则
 * @param url url 地址
 * @param context 配置上下文
 */
export const defaultRewriteFn: UrlRewrite<HttpClientOptions> = (url, context) => {
  const {rewrite, microService = {}, microAlias} = context;
  // ------------------------------------------------------- todo remove in next
  deprecated(context, 'microPrefix', 'microAlias', 'HttpClientOptions');
  let microPrefix: string | string[] = context.microPrefix;
  // -------------------------------------------------------

  /* 微服务前缀获取 */
  if (microAlias) microPrefix = microService[microAlias];

  // if (rewrite) {
  //   return rewrite(url, context, defaultRewriteFn);
  // }

  /* 去除 /api 前缀 */
  const trimUrl = trimPrefixUrl(/^\/api\/?(.*)/, url, microPrefix);

  /* 替换占位参数 */
  return replacePlaceholderParameters(trimUrl, context.paths);
};

export const DEFAULT_HTTP_CLIENT_CONFIGURATION: GlobalHttpClientConfiguration = {
  env: 'default',
  factory: 'umi-request',
  // rewrite: (url, context, defaultRewrite) => {
  //   /* 默认 url 重写规则 => 去除 /api 前缀,并替换占位参数 */
  //   return defaultRewrite ? defaultRewrite(url, context) : url;
  // },
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
