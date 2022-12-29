import { AsArray, AsyncSeriesWaterfallHook } from 'tapable';
import { HttpClientOptions } from '../types';

class HeaderHook extends AsyncSeriesWaterfallHook<Headers, HttpClientOptions> {
  constructor(name: string = 'HeaderHook') {
    super(['headers', 'options'] as AsArray<any>, name);
  }
}

export default HeaderHook;
