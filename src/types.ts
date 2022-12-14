import { JSONPathOptions } from 'jsonpath-plus';
import { TokenOptions } from './token';

type HttpMethod =
  | 'get'
  | 'GET'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'delete'
  | 'DELETE'
  | 'options'
  | 'OPTIONS'
  | string;
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

export type UrlRewrite<Context extends Omit<HttpClientOptions, 'rewrite'>> = (
  url: string,
  context: Context,
  defaultRewrite?: UrlRewrite<Context>,
) => string;

/**
 * 通用配置选项
 */
export interface HttpClientCommonOptions<C = any> {
  /**
   * 重写 url 地址
   */
  rewrite?: UrlRewrite<C>;

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

  /**
   * 服务端错误映射
   */
  errorMapping?: Record<string | number, string>;
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

export interface PrefixOptions {
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
   * 是否使用模拟数据
   */
  mock?: boolean;
}

export interface MicroOptions {
  /**
   * 微服务配置（ <服务别名>:<前缀> ）
   */
  microService?: MicroServiceConfiguration & { [key: string]: string };

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
}

export type PathValue = string | number | boolean;

export interface aa {
  a: string;
  b: number;
  c: boolean;
}

/**
 * 简化参数
 */
export interface SimplifyOptions {
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
   * url 占位参数
   * 自动替换 {path} 相关占位参数
   */
  paths?: PathValue | Record<string, PathValue>;
}

export interface HttpClientOptions
  extends PrefixOptions,
    MicroOptions,
    SimplifyOptions,
    HttpClientCommonOptions<HttpClientOptions> {
  /**
   * 请求类库
   */
  factory?: 'umi-request' | 'axios';

  /**
   * @description 请求接口地址
   */
  url?: string;

  /**
   * @description 请求方法
   * @default GET
   */
  method?: HttpMethod;

  /**
   * GET 请求参数
   */
  // params?: URLSearchParams;

  /**
   * PUT POST 等请求体数据
   */
  // data?: any;

  // [key: string]: any;
}

export const HTTP_CLIENT_KEYS = ['url', 'microPrefix', 'micro', 'upload', 'download', 'mock', ...COMMON_KEYS];

/**
 * 全局配置
 */
export interface GlobalHttpClientConfiguration extends HttpClientOptions {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;
}
