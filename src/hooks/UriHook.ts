import { AsArray, AsyncSeriesWaterfallHook } from 'tapable';
import { replacePlaceholderParameters, urlPathJoin } from '../utils';
import { UriPlugin } from './const';
import { UriOptions } from '../config';

class UriHook extends AsyncSeriesWaterfallHook<[string, UriOptions]> {
  constructor(name: string = 'UriHook') {
    super(['url', 'options'] as AsArray<any>, name);

    /* 去除前端约定的默认 “/api” 前缀 */
    this.tap({ name: 'api', stage: UriPlugin.TRIM_API }, (url = '', opts) => {
      return url.replace(/^\/api\/?(.*)/, '/$1');
    });

    /* 微服务前缀 */
    this.tap({ name: 'micro', stage: UriPlugin.MICRO }, (url, opts) => {
      const { service, alias } = opts;
      let microPrefix: string = '';

      const arr: string[] = [];
      /* 微服务前缀获取 */
      if (service && alias) microPrefix = service[alias];
      if (microPrefix) arr.push(microPrefix);

      arr.push(url);
      return urlPathJoin(arr);
    });

    /* prefix 前缀 */
    this.tap({ name: 'prefix', stage: UriPlugin.PREFIX }, (url, opts) => {
      const { prefix = '', env = 'default' } = opts;
      let envPrefix: Record<string, string> = {};

      /* 局部配置 */
      if (typeof prefix == 'string') {
        envPrefix['default'] = prefix;
      } else if (typeof prefix == 'object') {
        envPrefix = prefix;
      }

      let f: string = '';

      if (Reflect.has(envPrefix, env)) f = envPrefix[env];

      return urlPathJoin([f, url]);
    });

    /* 占位参数替换 */
    this.tap({ name: 'paths', stage: UriPlugin.PATHS }, (url, { paths }) => {
      return replacePlaceholderParameters(url, paths);
    });
  }
}

export default UriHook;
