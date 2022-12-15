import { HttpClientOptions } from '../types';
import { SyncWaterfallHook } from 'tapable';

class OptsHook extends SyncWaterfallHook<[HttpClientOptions]> {
  constructor(name?: string) {
    super(['HttpClientOptions'] as any, name);

    this.tap({ name: 'simplify', stage: -10000 }, (opts) => {
      if (opts.mock) opts.env = 'mock';
      return opts;
    });

    this.tap({ name: 'method', stage: 10000 }, (opts) => {
      opts.method = (opts?.method || 'GET').toLowerCase();
      return opts;
    });
  }
}

export default OptsHook;
