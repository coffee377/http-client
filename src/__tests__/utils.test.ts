import { describe, expect, test } from '@jest/globals';
import {
  deprecated,
  DEPRECATED_MESSAGE,
  deprecatedMessage,
  getTokenParamKey,
  slash,
  slashTrim,
  transformParams,
  trimApiPrefixUrl,
  urlPathJoin,
} from '../utils';

test('deprecatedMessage', () => {
  const msg = deprecatedMessage('a', 'b', 'Test');
  const result = DEPRECATED_MESSAGE.replace(/\{A}(.*)\{B}(.*)/, `Test.a$1Test.b$2`);
  expect(msg).toBe(result);
});

describe('deprecated', () => {
  test('废弃属性被使用', () => {
    deprecated({ a: '1', b: 2 }, 'a', 'b');
  });

  test('废弃属性未使用', () => {
    deprecated({ b: 2 }, 'a', 'b');
  });
});

describe('get token param key', () => {
  // test('getToken', () => {
  //   // getToken('access_token');
  // });
  test('无参数', () => {
    expect(getTokenParamKey()).toEqual('Authorization');
  });
  test('默认选项', () => {
    expect(getTokenParamKey('access_token')).toEqual('Authorization');
    expect(getTokenParamKey('refresh_token')).toEqual('refresh_token');
    expect(getTokenParamKey('id_token')).toEqual('id_token');
  });
  test('自定义默认选项', () => {
    const opts = { paramKey: { access_token: 'access_token' } };
    expect(getTokenParamKey('access_token', opts)).toEqual('access_token');
    expect(getTokenParamKey('refresh_token')).toEqual('refresh_token');
    expect(getTokenParamKey('id_token')).toEqual('id_token');
  });
});

describe('slash', () => {
  test('slash', () => {
    expect(slash('一路走好')).toBe('一路走好');
    expect(slash('\\a\\b\\c\\')).toBe('/a/b/c/');
    expect(slash('\\a\\b\\c')).toBe('/a/b/c');
    expect(slash('a\\b\\c\\')).toBe('a/b/c/');
  });
  test('slashTrim', () => {
    expect(slashTrim('/a/b/c/')).toBe('a/b/c');
    expect(slashTrim('/a/b/c')).toBe('a/b/c');
    expect(slashTrim('a/b/c/')).toBe('a/b/c');
  });
});

test('url path join', () => {
  expect(urlPathJoin()).toBeUndefined();

  const a = ['a', '/a', 'a/', '/a/'];
  const b = ['b', '/b', 'b/', '/b/'];

  for (let A of a) {
    expect(urlPathJoin(A)).toBe('/a');
    for (let B of b) {
      expect(urlPathJoin([A, B])).toBe('/a/b');
    }
  }
});

test('trim api prefix url', () => {
  expect(trimApiPrefixUrl('/api')).toBe('/');
  expect(trimApiPrefixUrl('/api/a')).toBe('/a');
  expect(trimApiPrefixUrl('/api/a', 'b/c')).toBe('/b/c/a');
  expect(trimApiPrefixUrl('/api/a', '')).toBe('/a');
  expect(trimApiPrefixUrl('/api/a', ['b', 'c'])).toBe('/b/c/a');
});

describe('transform params', () => {
  test('url', () => {
    const opts1 = transformParams('/api/auth/login');
    expect(opts1).toBeDefined();
    expect(Object.keys(opts1).length).toBe(1);
    expect(opts1.url).toBe('/api/auth/login');
  });

  test('opts', () => {
    const opts2 = transformParams({ url: '/a/b/c', method: 'post', micro: 'auth' });
    expect(opts2).toBeDefined();
    expect(Object.keys(opts2).length).toBe(3);
    expect(opts2.url).toBe('/a/b/c');
    expect(opts2.method).toBe('post');
    expect(opts2.micro).toBe('auth');
  });
  test('url & opts', () => {
    const opts3 = transformParams('/api/a/b/c', { url: '/a/b/c', method: 'post', micro: 'auth' });
    expect(opts3).toBeDefined();
    expect(Object.keys(opts3).length).toBe(3);
    expect(opts3.url).toBe('/api/a/b/c');
    expect(opts3.method).toBe('post');
    expect(opts3.micro).toBe('auth');
  });
});
