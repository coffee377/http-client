import type { RequestOptionsInit, RequestResponse } from 'umi-request';
import { ResponseError, ResponseType } from 'umi-request';
import { JSONPathOptions } from 'jsonpath-plus';

type RequestMethodType = 'get' | 'post' | 'put' | 'delete' | string;

/**
 * @description 请求结果
 */
export type RequestResult<R, B = false> = B extends true ? Promise<RequestResponse<R>> : Promise<R>;

export interface TokenOption {
  /**
   * 令牌 Key 值
   * @default Authorization
   */
  key?: string;
  /**
   * 令牌存储位置
   * @default local
   */
  storage?: 'local' | 'session';
  /**
   * 令牌前缀
   */
  prefix?: string;
  /**
   * 是否 bearer token
   * @default false
   */
  bearer?: boolean;
}

/**
 * 数据格式化
 * @see https://www.npmjs.com/package/jsonpath-plus
 * @see https://github.com/JSONPath-Plus/JSONPath
 */
export type DataFormat<D = any, R = any> = ((data: D) => R) | string | Omit<JSONPathOptions, 'json'>;

export interface RequestOptions extends RequestOptionsInit {
  /**
   * @description 请求路径
   */
  url?: string;

  /**
   * @description 字符集
   * @default utf8
   */
  charset?: 'utf8' | 'gbk';

  /**
   * @description 服务前缀, 若存在 microPrefix, 则最终值为 [prefix][/microPrefix1][/microPrefix2][...]
   * @see RequestOptions#microPrefix
   */
  prefix?: string;

  /**
   * @description 微服务前缀
   * @see RequestOptions#prefix
   * @deprecated use micro instead
   */
  microPrefix?: string | string[];

  /**
   * @description 微服务前缀
   */
  micro?: string | string[];

  /**
   * @description 请求方法
   * @default GET
   */
  method?: RequestMethodType;

  /**
   * @description 请求类型,用来简化写content-Type, 默认json
   * @default json
   */
  requestType?: 'json' | 'form';

  /**
   * @description 是否文件上传(requestType = 'form')
   * @default false
   * @since 0.2.5
   */
  upload?: boolean;

  /**
   * 请求数据
   */
  data?: any;

  /**
   * @description query 参数
   */
  params?: object | URLSearchParams;

  /**
   * @description 服务端返回的数据类型, 用来解析数据
   * @default json
   */
  responseType?: ResponseType;

  /**
   * @description 是否文件下载 blob(responseType = 'blob')
   * @since 0.2.5
   * @default false
   */
  download?: boolean;

  /**
   * @description 格式化响应数据
   */
  resultFormat?: DataFormat;

  /**
   * @description 超时时长(ms), 默认未设
   */
  timeout?: number;

  /**
   * @description 错误处理
   * @param error
   */
  errorHandler?: (error: ResponseError) => void;

  /**
   * @description token 相关配置
   */
  token?: TokenOption;
}

export interface HttpRequest {
  get: HttpRequest;
  post: HttpRequest;
  put: HttpRequest;
  delete: HttpRequest;
  options: HttpRequest;

  <R = any>(url: string): Promise<R>;

  <R = any>(service: RequestOptions): Promise<R>;

  <R = any>(url: string, options: RequestOptions): Promise<R>;
}
