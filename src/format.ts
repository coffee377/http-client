import { JSONPath, JSONPathOptions } from 'jsonpath-plus';
import { DataFormat } from './types';

/**
 * @description 数据格式化
 * @param data
 * @param formatter
 */
export const formatData = <D = any, R = any>(data: D, formatter?: DataFormat<D, R>) => {
  let finalResult: R;
  if (typeof formatter === 'function') {
    finalResult = formatter(data);
  } else if (typeof formatter === 'object' && Object.keys(formatter).length > 0) {
    finalResult = JSONPath({
      json: data,
      flatten: true,
      wrap: false,
      ...formatter,
    } as unknown as JSONPathOptions);
  } else if (typeof formatter === 'string' && formatter) {
    finalResult = JSONPath({
      json: data,
      flatten: true,
      wrap: false,
      path: formatter,
    } as unknown as JSONPathOptions);
  } else {
    finalResult = data;
  }
  return finalResult;
};
