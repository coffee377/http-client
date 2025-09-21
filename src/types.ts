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
  /**
   * 汇总数据字段
   */
  summary?: string;
}

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
