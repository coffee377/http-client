import { UriOptions } from '../types';
import { SyncWaterfallHook } from 'tapable';
import { deprecated, replacePlaceholderParameters, urlPathJoin } from '../utils';

class UriHook extends SyncWaterfallHook<[string, UriOptions], UriOptions> {
  constructor(name?: string) {
    super(['url', 'options'] as any, name);

    /* 去除 ”/api“ 前缀 */
    this.tap({ name: 'api', stage: -10000 }, (url, opts) => {
      return url.replace(/^\/api\/?(.*)/, '/$1');
    });

    /* 微服务前缀 */
    this.tap({ name: 'micro' }, (url, opts) => {
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
    this.tap({ name: 'path' }, (url, { paths }) => {
      return replacePlaceholderParameters(url, paths);
    });
  }
}

export default UriHook;
