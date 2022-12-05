import { extend } from 'umi-request';

const request = extend({
  prefix: '/api/v1',
  suffix: '.json',
  timeout: 1000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  params: {
    token: 'xxx', // 所有请求默认带上 token 参数
  },
  errorHandler: function (error) {
    /* 异常处理 */
  },
});

// request.interceptors.request.use((f, d) => {});
