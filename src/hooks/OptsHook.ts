import { SyncWaterfallHook } from 'tapable';
import { HttpClientOptions } from '../config';
import { HttpMethod } from '../http';

class OptsHook extends SyncWaterfallHook<[HttpClientOptions]> {
  constructor(name?: string) {
    super(['HttpClientOptions'] as any, name);

    this.tap({ name: 'method', stage: 10000 }, (opts) => {
      opts.method = (opts?.method ?? 'GET').toUpperCase() as HttpMethod;
      return opts;
    });
  }
}

export default OptsHook;
