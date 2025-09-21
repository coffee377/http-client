import { ParameterValue, Property, ResultFieldInfo } from "./types";
import { RequestExecutor } from "@/http/executor";
import { HttpAdapter, HttpHandler } from "./http";
import { DataConversion } from "./data";
import { TokenOptions } from "./token";
import { HttpMethod } from "./http";

export interface EnvPrefix {
  dev?: string;
  test?: string;
  pre?: string;
  prod?: string;
  mock?: string;
  [key: string]: string;
}

export type Env = "default" | keyof EnvPrefix;

export interface PrefixOptions {
  /**
   * 环境名称
   * @since 0.3.0
   */
  env?: Env;

  /**
   * 接口请求（或指定环境）前缀
   */
  prefix?: string | EnvPrefix;
}

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

export interface MicroOptions<M extends MicroService = MicroService> {
  /**
   * 微服务配置（ <服务别名>:<前缀> ）
   * @since 1.0
   */
  services?: M;

  /**
   * @description 微服务别名（配置的 key）
   * @since 1.0
   */
  alias?: keyof M;
}

export interface UriOptions<M extends MicroService = MicroService> extends PrefixOptions, MicroOptions<M> {
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

export type BodyData = string | Property | ArrayBuffer | ArrayBufferView | FormData | File | Blob | URLSearchParams;

export type ResponseType = "json" | "text" | "blob" | "arrayBuffer" | "bytes";

/**
 * 通用配置选项
 */
export interface HttpClientCommonOptions {
  /**
   * HTTP 处理器
   */
  factory?: "fetch" | "xhr" | HttpHandler;

  /**
   * 请求头配置
   */
  headers?: Record<string, string>;

  /**
   * 令牌相关配置
   */
  token?: TokenOptions;

  /**
   * 响应数据处理
   */
  dataConversion?: DataConversion;

  /**
   * 响应实体相关字段配置
   */
  filedInfo?: ResultFieldInfo;

  /**
   * 前端定义的错误信息映射
   */
  errorMapping?: Record<string | number, string>;
}

/**
 * 全局配置
 */
export interface GlobalHttpClientConfiguration
  extends Omit<UriOptions, "paths" | "pathsReplace" | "params" | "alias">,
    HttpClientCommonOptions {
  /**
   * @description 接口是否代理到本地，配合接口代理(如 nginx)进行处理
   * @default false
   */
  proxy?: boolean;
}

/**
 * 请求参数
 */
export interface RequestOptions<M extends MicroService = MicroService> extends UriOptions<M>, HttpClientCommonOptions {
  /**
   * HTTP 处理器
   */
  factory?: "fetch" | "xhr" | HttpAdapter;
  executor?: "fetch" | "xhr" | RequestExecutor;

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
}

export interface HttpClientOptions extends RequestOptions {
  /**
   * @description 请求接口地址
   */
  url?: string;
  /**
   * @description 请求方法
   * @default GET
   */
  method?: HttpMethod;
}
