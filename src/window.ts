import { DataFormat } from './index';
import { microUrl } from './util';

interface Window {
  __APP_REQUEST_CONF__: AppRequestConfiguration;
}

/**
 * 响应结果配置
 */
interface ResultField {
  /**
   * @description 请求成功标记字段
   */
  success?: string;
  /**
   * @description 错误编码字段
   */
  code?: string;
  /**
   * @description 错误信息字段
   */
  message?: string;
  /**
   * @description 返回数据字段
   */
  data?: string;
}

interface PageField {
  /**
   * 总记录条数字段
   */
  total?: string;
  /**
   * 总页数字段
   */
  count?: string;
  /**
   * 当前页码字段
   */
  pageNum?: string;
  /**
   * 页面数据条数字段
   */
  pageSize?: string;
  /**
   * 数据记录字段
   */
  records?: string;
}

export interface AppRequestConfiguration {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;

  /**
   * @description 环境名称
   */
  env?: 'dev' | 'test' | 'prod' | 'mock' | string;

  /**
   * 非代理模式下，接口请求或指定环境前缀(全局)
   */
  prefix?: string | Record<string, string>;

  /**
   * 重写 url 地址
   * @param url
   * @param proxy 接口是否代理到本地
   * @param micro 微服务前缀
   */
  rewrite?: (url: string, proxy: boolean, micro: string | string[]) => string;

  /**
   * @description 数据格式化处理
   */
  resultFormat?: DataFormat;

  /**
   * 响应结果配置
   */
  result?: ResultField;

  /**
   * 分页结果配置
   */
  page?: PageField;

  /**
   * 服务端业务错误映射
   */
  errorMapping?: Record<string | number, string>;
}

export const DEFAULT_APP_REQUEST_CONFIGURATION: AppRequestConfiguration = {
  proxy: false,
  rewrite: (url, proxy, micro) => {
    if (!proxy) {
      return microUrl(url, micro);
    }
    return url;
  },
  resultFormat: '$.data',
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
};
