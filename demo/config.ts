import { GlobalHttpClientConfiguration } from '../src/config';
import http from '../src';

console.log(`Starting Http Client ${http.version} Test`);

Object.defineProperty(window, '__HTTP_CLIENT_CONFIG__', {
  configurable: false,
  enumerable: false,
  value: {
    env: 'dev',
    services: {
      auth: 'basic',
      base: 'basic',
      oneself: '',
    },
    prefix: {
      dev: 'https://api.github.com',
      test: 'http://teamwork-test.jqk8s.jqsoft.net/api',
      prod: '/prod',
    },
  } as GlobalHttpClientConfiguration,
});
