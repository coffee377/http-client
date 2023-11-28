import { JSONPath, JSONPathOptions } from 'jsonpath-plus';

/**
 * 数据转换
 * @see https://www.npmjs.com/package/jsonpath-plus
 * @see https://github.com/JSONPath-Plus/JSONPath
 */
export type DataConversion<Result = any, Data = any> =
  | ((data: Data) => Result)
  | string
  | Omit<JSONPathOptions, 'json'>
  | false;

/**
 * @description 数据格式化
 * @param data
 * @param transform
 */
export const dataTransform = <Result = any, Data = any>(data: Data, transform?: DataConversion<Result, Data>) => {
  let result: Result;
  if (typeof transform === 'function') {
    result = transform(data);
  } else if (typeof transform === 'object' && Object.keys(transform).length > 0) {
    result = JSONPath({
      json: data,
      flatten: true,
      wrap: false,
      ...transform,
    } as unknown as JSONPathOptions);
  } else if (typeof transform === 'string' && transform) {
    result = JSONPath({
      json: data,
      flatten: true,
      wrap: false,
      path: transform,
    } as unknown as JSONPathOptions);
  } else {
    result = data as unknown as Result;
  }
  return result;
};

export default dataTransform;
