import { HttpHandler } from './handler';
import { ParameterValue, Property } from './types';

export type Env = 'default' | 'dev' | 'test' | 'prod' | 'mock' | string;

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

export interface UriOptions extends MicroOptions {
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

export interface RequestOptions extends PrefixOptions {
  /**
   * HTTP 处理器
   */
  handler?: HttpHandler;

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
   * 是否报告相关进度
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
  credentials?: 'omit' | 'same-origin' | 'include'; // default
}

export interface HttpConfig extends RequestOptions {
  /**
   * The default HTTP backend handler
   */
  handler?: HttpHandler;
}

export const config: HttpConfig = {};
