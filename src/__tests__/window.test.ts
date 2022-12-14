import { describe, expect, test } from '@jest/globals';
import { GlobalHttpClientConfiguration, HttpClientOptions } from '../types';
import { DEFAULT_HTTP_CLIENT_CONFIGURATION } from '../window';
import { merge } from 'lodash-es';

describe('GlobalHttpClientConfiguration', () => {
  test('config', () => {
    const def: GlobalHttpClientConfiguration = DEFAULT_HTTP_CLIENT_CONFIGURATION;
    const newConfig: GlobalHttpClientConfiguration = {
      filedInfo: {
        result: {
          success: 'succeed',
          message: 'msg',
        },
      },
    };
    const result: GlobalHttpClientConfiguration = merge(def, newConfig);

    expect(result.filedInfo.result.success === 'succeed').toBeTruthy();
    expect(result.filedInfo.result.code === 'code').toBeTruthy();
    expect(result.filedInfo.result.message === 'msg').toBeTruthy();
    expect(result.filedInfo.result.data === 'data').toBeTruthy();
  });
});

describe('url rewrite', () => {
  test('without path parma', () => {
    const { rewrite } = DEFAULT_HTTP_CLIENT_CONFIGURATION;

    const result = rewrite<HttpClientOptions>('/api/login', {
      microService: { auth: '/aaa' },
      microAlias: 'auth',
    });
    expect(result).toBe('/aaa/login');
  });

  test('with one path parma', () => {
    const { rewrite } = DEFAULT_HTTP_CLIENT_CONFIGURATION;

    const result = rewrite<HttpClientOptions>('/api/{login}', {
      microService: { auth: '/aaa' },
      microAlias: 'auth',
      paths: 'oauth2_login',
    });
    expect(result).toBe('/aaa/oauth2_login');
  });

  test('with more path parma', () => {
    const { rewrite } = DEFAULT_HTTP_CLIENT_CONFIGURATION;

    const result = rewrite<HttpClientOptions>('/api/{a}/{b}/{c}/test', {
      microService: { auth: '/aaa' },
      microAlias: 'auth',
      paths: {
        a: '1',
        b: 2,
        c: false,
      },
    });
    expect(result).toBe('/aaa/1/2/false/test');
  });

  test('not exist path parma', () => {
    const { rewrite } = DEFAULT_HTTP_CLIENT_CONFIGURATION;

    const result = () => {
      rewrite<HttpClientOptions>('/api/{a}/{b}/{c}/test', {
        microService: { auth: '/aaa' },
        microAlias: 'auth',
        paths: {
          a: '1',
          b: 2,
        },
      });
    };
    expect(result).toThrow();
  });
});
