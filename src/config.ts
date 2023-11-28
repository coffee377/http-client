import { HttpAdapter, HttpHandler } from './http/handler';
import { FiledInfo, ParameterValue, Property } from './types';
import { HttpMethod } from './http/request';
import { TokenOptions } from './token';
import { DataConversion } from './data';

export type Env = 'default' | 'dev' | 'test' | 'pre' | 'prod' | string;

export interface MicroService {
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

/**
 * 微服务配置
 * @deprecated
 */
export interface MicroServiceConfiguration extends MicroService {}

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
}

export interface MicroOptions {
  /**
   * 微服务配置（ <服务别名>:<前缀> ）
   * @since 1.0
   */
  service?: MicroService & Record<string, string>;

  /**
   * @description 微服务别名（配置的 key）
   * @since 1.0
   */
  alias?: keyof MicroService | string;
}

export interface UriOptions extends PrefixOptions, MicroOptions {
  /**
   * url 占位参数
   * 自动替换 {path} 相关占位参数
   */
  paths?: ParameterValue | Record<string, ParameterValue>;

  /**
   * 占位参数替换函数
   * @param url
   * @param pathsParams
   */
  pathsReplace?: (url: string, pathsParams: Record<string, ParameterValue>) => string;

  /**
   * query 请求参数
   */
  params?: string | Record<string, ParameterValue> | URLSearchParams;

  /**
   * query 参数序列化
   * @param params
   */
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

export type BodyData =
  | string
  | Property
  | ArrayBuffer
  | ArrayBufferView
  | FormData
  | File
  | Blob
  | URLSearchParams
  | any;

export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

/**
 * 通用配置选项
 */
export interface HttpClientCommonOptions {
  /**
   * HTTP 处理器
   */
  factory?: 'fetch' | 'xhr' | HttpHandler;

  /**
   * 请求头配置
   */
  headers?: Record<string, string>;

  /**
   * 令牌相关配置
   */
  token?: TokenOptions;

  /**
   * 数据格式化处理
   * @deprecated use dataConversion instead
   */
  resultFormat?: DataConversion;

  /**
   * 响应数据处理
   */
  dataConversion?: DataConversion;

  /**
   * 响应实体相关字段配置
   */
  filedInfo?: FiledInfo;

  /**
   * 前端定义的错误信息映射
   */
  errorMapping?: Record<string | number, string>;
}

/**
 * 全局配置
 */
export interface GlobalHttpClientConfiguration extends Omit<UriOptions, 'alias'>, HttpClientCommonOptions {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;
}

/**
 * 请求参数
 */
export interface RequestOptions extends UriOptions, SimplifyOptions, HttpClientCommonOptions {
  /**
   * @description 请求接口地址
   */
  url?: string;

  /**
   * HTTP 处理器
   */
  factory?: 'fetch' | 'xhr' | HttpAdapter;

  /**
   * @description 请求方法
   * @default GET
   */
  method?: HttpMethod;

  /**
   * 请求头
   */
  headers?: Record<string, string>;

  /**
   * 请求数据
   */
  data?: BodyData;

  /**
   * 超时时间
   */
  timeout?: number;

  /**
   * 响应类型
   */
  responseType?: ResponseType;

  /**
   * 是否报告相关进度（上传下载时使用）
   */
  reportProgress?: boolean;

  /**
   * 是否携带 cookie
   */
  withCredentials?: boolean;

  // 'credentials' indicates whether the user agent should send cookies from the other domain in the case of cross-origin requests.
  // omit: Never send or receive cookies.
  // same-origin: Send user credentials (cookies, basic http auth, etc..) if the URL is on the same origin as the calling script. This is the default value.
  // include: Always send user credentials (cookies, basic http auth, etc..), even for cross-origin calls.
  // credentials?: 'omit' | 'same-origin' | 'include'; // default
}

export interface HttpClientOptions extends RequestOptions {
  /**
   * @description 请求接口地址
   */
  url?: string;
}
