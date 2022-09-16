import type { RequestOptionsInit, RequestResponse } from 'umi-request';
import { JSONPathOptions } from 'jsonpath-plus';

type RequestMethodType = 'get' | 'post' | 'put' | 'delete' | 'options' | string;

/**
 * @description 请求结果
 */
export type RequestResult<R, B = false> = B extends true ? Promise<RequestResponse<R>> : Promise<R>;

export interface TokenOptions {
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
export type DataFormat<D = any, R = any> = ((data: D) => R) | string | Omit<JSONPathOptions, 'json'> | false;

/**
 * 响应结果配置
 */
export interface ResultFieldInfo {
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

/**
 * 分页配置
 */
export interface PageFieldInfo {
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

export interface FiledInfo {
  /**
   * 响应结果相关配置
   */
  result?: ResultFieldInfo;

  /**
   * 分页信息配置
   */
  page?: PageFieldInfo;
}

export type Env = 'dev' | 'test' | 'prod' | 'mock' | string;

export interface HttpRequestCommonOptions {
  /**
   * 环境名称
   */
  env?: Env;

  /**
   * 接口请求或指定环境前缀
   */
  prefix?: string | Record<string, string>;

  /**
   * 请求头配置
   */
  headers?: HeadersInit;

  /**
   * 令牌相关配置
   */
  token?: TokenOptions;

  /**
   * 数据格式化处理
   */
  resultFormat?: DataFormat;

  /**
   * 响应实体相关字段配置
   */
  filedInfo?: FiledInfo;
}

export const COMMON_KEYS = ['env', 'prefix', 'headers', 'token', 'resultFormat', 'filedInfo'];

export interface RequestPlusOptions extends HttpRequestCommonOptions {
  /**
   * @description 微服务前缀
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
   * @description 是否文件上传(requestType = 'form')
   * @default false
   * @since 0.2.5
   */
  upload?: boolean;

  /**
   * @description 是否文件下载 blob(responseType = 'blob')
   * @since 0.2.5
   * @default false
   */
  download?: boolean;

  /**
   * 是否使用模拟数据
   */
  mock?: boolean;
}

export const REQUEST_PLUS_KEYS = ['microPrefix', 'micro', 'upload', 'download', 'mock', ...COMMON_KEYS];

export interface HttpRequestOptions extends Omit<RequestOptionsInit, ['prefix', 'headers']>, RequestPlusOptions {}

export interface HttpRequest {
  get: HttpRequest;
  post: HttpRequest;
  put: HttpRequest;
  delete: HttpRequest;
  options: HttpRequest;

  <R = any>(url: string): Promise<R>;

  <R = any>(service: HttpRequestOptions): Promise<R>;

  <R = any>(url: string, options: HttpRequestOptions): Promise<R>;
}

/**
 * 全局配置
 */
export interface GlobalHttpRequestConfiguration extends HttpRequestCommonOptions {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;

  /**
   * 重写 url 地址
   * @param url
   * @param proxy 接口是否代理到本地
   * @param micro 微服务前缀
   */
  rewrite?: (url: string, proxy: boolean, micro?: string | string[]) => string;

  /**
   * 服务端业务错误映射
   */
  errorMapping?: Record<string | number, string>;
}
