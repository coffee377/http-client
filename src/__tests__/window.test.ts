import { expect, test } from '@jest/globals';
import { GlobalHttpClientConfiguration } from '../types';
import { DEFAULT_APP_REQUEST_CONFIGURATION } from '../window';
import { merge } from 'lodash-es';

test('GlobalHttpClientConfiguration', () => {
  const def: GlobalHttpClientConfiguration = DEFAULT_APP_REQUEST_CONFIGURATION;
  const newConfig: GlobalHttpClientConfiguration = {
    filedInfo: {
      result: {
        success: 'succeed',
        message: 'msg',
      },
    },
  };
  const result: GlobalHttpClientConfiguration = merge(def, newConfig);

  const { rewrite } = def;

  if (rewrite) {
    const proxyResult = rewrite('/api/login', true, 'auth');
    expect(proxyResult).toBe('/auth/login');
    const result = rewrite('/api/login', false, 'auth');
    expect(result).toBe('/auth/login');
  }

  expect(result.filedInfo.result.success === 'succeed').toBeTruthy();
  expect(result.filedInfo.result.code === 'code').toBeTruthy();
  expect(result.filedInfo.result.message === 'msg').toBeTruthy();
  expect(result.filedInfo.result.data === 'data').toBeTruthy();
});
