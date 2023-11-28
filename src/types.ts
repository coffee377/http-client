import { HttpClientOptions } from './config';

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

export type UrlRewrite<Context extends HttpClientOptions> = (
  url: string,
  context: Context,
  defaultRewrite?: UrlRewrite<Omit<Context, 'rewrite'>>,
) => string;

// export const COMMON_KEYS = [
//   'factory',
//   'env',
//   'prefix',
//   'microService',
//   'headers',
//   'token',
//   'resultFormat',
//   'filedInfo',
// ];

// export const HTTP_CLIENT_KEYS = ['url', 'microPrefix', 'micro', 'upload', 'download', 'mock', ...COMMON_KEYS];

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
