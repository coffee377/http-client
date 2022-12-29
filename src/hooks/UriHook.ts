import { UriOptions } from '../types';
import { AsArray, AsyncSeriesWaterfallHook } from 'tapable';
import { deprecated, replacePlaceholderParameters, urlPathJoin } from '../utils';
import { UriPlugin } from './const';

interface UriPlugin {
  name: string;
  type?: '';
  stage?: number;
  before?: string;
  fn: (url: string, opts: UriOptions) => string | Promise<string>;
}

// export type UriPlugin = (url: string, opts: UriOptions) => string | Promise<string>;

class UriHook extends AsyncSeriesWaterfallHook<[string, UriOptions]> {
  constructor(name: string = 'UriHook') {
    super(['url', 'options'] as AsArray<any>, name);

    /* 去除 ”/api“ 前缀 */
    this.tap({ name: 'api', stage: UriPlugin.API }, (url = '', opts) => {
      return url.replace(/^\/api\/?(.*)/, '/$1');
    });

    /* 微服务前缀 */
    this.tap({ name: 'micro', stage: UriPlugin.MICRO }, (url, opts) => {
      // ------------------------------------------------------- todo remove in next
      deprecated(opts, 'microPrefix', 'microAlias', 'HttpClientOptions');
      let microPrefix: string | string[] = opts.microPrefix;
      // -------------------------------------------------------

      /* 微服务前缀获取 */
      if (opts.microService && opts.microAlias) microPrefix = opts.microService[opts.microAlias];

      const arr: string[] = [];
      /* 微服务前缀 */
      if (typeof microPrefix === 'string') {
        arr.push(microPrefix);
      } else if (Array.isArray(microPrefix)) {
        arr.push(...microPrefix);
      }
      arr.push(url);
      return urlPathJoin(arr);
    });

    /* 占位参数替换 */
    this.tap({ name: 'paths', stage: UriPlugin.PATHS }, (url, { paths }) => {
      return replacePlaceholderParameters(url, paths);
    });
  }
}

export default UriHook;
