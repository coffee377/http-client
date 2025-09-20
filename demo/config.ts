import { GlobalHttpClientConfiguration } from '@/config';

Object.defineProperty(window, '__HTTP_CLIENT_CONFIG__', {
  configurable: false,
  enumerable: false,
  value: {
    env: 'dev',
    services: {
      auth: 'basic',
      base: 'basic',
      oneself: '',
      oss: 'oss',
    },
    prefix: {
      dev: 'https://api.github.com',
      test: 'http://teamwork-test.jqk8s.jqsoft.net/api',
      prod: '',
    },
  } as GlobalHttpClientConfiguration,
});
