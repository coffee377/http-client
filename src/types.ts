import { JSONPathOptions } from 'jsonpath-plus';
import { TokenOptions } from './token';

type RequestMethodType = 'get' | 'post' | 'put' | 'delete' | 'options' | string;
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
   * @description 响应错误编码字段
   */
  code?: string;
  /**
   * @description 响应信息字段
   */
  message?: string;
  /**
   * @description 返回数据字段
   */
  data?: string;
  /**
   * 记录整条数字段
   */
  total?: string;
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

/**
 * 通用配置选项
 */
export interface HttpClientCommonOptions {
  /**
   * 请求类库
   */
  factory?: 'umi-request' | 'axios';

  /**
   * 环境名称
   * @since 0.3.0
   */
  env?: Env;

  /**
   * 接口请求（或指定环境）前缀
   */
  prefix?: string | Record<string, string>;

  /**
   * 微服务配置（ <服务别名>:<前缀> ）
   */
  microService?: MicroServiceConfiguration & { [key: string]: string };

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

export const COMMON_KEYS = [
  'factory',
  'env',
  'prefix',
  'microService',
  'headers',
  'token',
  'resultFormat',
  'filedInfo',
];

/**
 * 微服务配置
 */
export interface MicroServiceConfiguration {
  /**
   * 统一认证服务
   */
  auth?: string;

  /**
   * 基础接口服务
   */
  base?: string;

  /**
   * 对象存储服务
   */
  oss?: string;

  /**
   * 当前系统接口服务
   */
  oneself?: string;
}

export interface HttpClientOptions extends HttpClientCommonOptions {
  /**
   * @description 请求接口地址
   */
  url?: string;

  /**
   * @description 微服务前缀
   * @deprecated use microAlias instead
   */
  microPrefix?: string | string[];

  /**
   * @description 微服务别名（配置的 key）
   * @since 0.3.0
   */
  microAlias?: keyof MicroServiceConfiguration | string;

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

  [key: string]: any;
}

export const HTTP_CLIENT_KEYS = ['url', 'microPrefix', 'micro', 'upload', 'download', 'mock', ...COMMON_KEYS];

export interface HttpClient {
  get: HttpClient;
  post: HttpClient;
  put: HttpClient;
  delete: HttpClient;
  options: HttpClient;

  <R = any>(url: string): Promise<R>;

  <R = any>(service: HttpClientOptions): Promise<R>;

  <R = any>(url: string, options: HttpClientOptions): Promise<R>;
}

export type UrlRewriteFn = (url: string, proxy: boolean, microPrefix: string | string[]) => string;

/**
 * 全局配置
 */
export interface GlobalHttpClientConfiguration extends HttpClientCommonOptions {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;

  /**
   * 重写 url 地址
   * @param url 以 /api开头的接口地址
   * @param proxy 接口是否代理到本地
   * @param microPrefix 微服务前缀
   * @param defaultRewrite 默认 url 重写函数
   */
  rewrite?: (url: string, proxy: boolean, microPrefix: string | string[], defaultRewrite?: UrlRewriteFn) => string;

  /**
   * 服务端业务错误映射
   */
  errorMapping?: Record<string | number, string>;
}
