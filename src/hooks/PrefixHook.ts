import { PrefixOptions } from '../types';
import { SyncWaterfallHook } from 'tapable';

class PrefixHook extends SyncWaterfallHook<[string, PrefixOptions], PrefixOptions> {
  constructor(name?: string) {
    super(['prefix', 'options'] as any, name);

    this.tap('env', (_, { prefix = '', env = 'default' }) => {
      const def: string = 'default';
      let envPrefix: Record<string, string> = {};

      /* 局部配置 */
      if (typeof prefix == 'string') {
        envPrefix[def] = prefix;
      } else if (typeof prefix == 'object') {
        envPrefix = prefix;
      }

      if (env && Reflect.has(envPrefix, env)) return envPrefix[env];

      return envPrefix[def] || '';
    });
  }
}

export default PrefixHook;
