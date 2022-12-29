import { JSONPathOptions } from 'jsonpath-plus';
import { TokenOptions } from './token';
import { MicroServiceConfiguration, PrefixOptions } from './config';

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

export type Env = 'default' | 'dev' | 'test' | 'prod' | 'mock' | string;

export type UrlRewrite<Context extends HttpClientOptions> = (
  url: string,
  context: Context,
  defaultRewrite?: UrlRewrite<Omit<Context, 'rewrite'>>,
) => string;

/**
 * 通用配置选项
 */
export interface HttpClientCommonOptions<C = any> {
  // /**
  //  * 重写 url 地址
  //  */
  // rewrite?: UrlRewrite<C>;

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



interface MicroOptions {
  /**
   * @description 微服务前缀
   * @deprecated use microAlias instead
   */
  microPrefix?: string | string[];

  /**
   * 微服务配置（ <服务别名>:<前缀> ）
   */
  microService?: MicroServiceConfiguration & { [key: string]: string };

  /**
   * @description 微服务别名（配置的 key）
   * @since 0.3.0
   */
  microAlias?: keyof MicroServiceConfiguration | string;
}

export interface UriOptions extends MicroOptions {
  /**
   * url 占位参数
   * 自动替换 {path} 相关占位参数
   */
  paths?: ParameterValue | Record<string, ParameterValue>;

  /**
   * query 请求参数
   */
  params?: string | Record<string, ParameterValue> | URLSearchParams;

  // params?: object | URLSearchParams;
  paramsSerializer?: (params: Record<string, ParameterValue>) => string;
}


/**
 * 简化参数
 */
export interface SimplifyOptions {
  /**
   * 是否使用模拟数据
   */
  mock?: boolean;

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
}

export interface HttpClientOptions
  extends PrefixOptions,
    UriOptions,
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

// -------------------------------------------
export type SafeAny = any;

/*  Any Object */
export type AnyObject = Record<string, SafeAny>;

/* Any Array */
export type AnyArray = SafeAny[];

/** Represents a class `T` */
export interface Type<T> extends Function {
  new (...args: SafeAny[]): T;
}

/**
 * Exclude methods from `T`
 *
 * ```ts
 * Property<{ x: string, y: () => void }> -> { x: string }
 * ```
 */
export type Property<T extends Record<string, any> = Record<string, any>> = Omit<
  T,
  { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
>;

/**
 * Exclude properties from `T`
 *
 * ```ts
 * Method<{ x: string, y: () => void }> -> { y: () => void }
 * ```
 */
export type Method<T extends Record<string, any> = Record<string, any>> = Omit<T, keyof Property<T>>;

export type ParameterValue = string | number | boolean;

export type Nullable<T> = T | null;
