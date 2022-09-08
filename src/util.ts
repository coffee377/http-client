/**
 * 获取令牌
 * @param opts 令牌参数
 */
import { TokenOption } from './index';

export function getToken(opts?: TokenOption): string {
  const { key = 'Authorization', storage = 'local', bearer, prefix } = opts ?? {};
  const sto = storage == 'session' ? sessionStorage : localStorage;
  const token = sto.getItem(key)?.replace(/["'](.*)["']/, '$1') || '';
  if (!!token && bearer) {
    return `bearer ${token}`;
  } else if (!!token && !!prefix) {
    return `${prefix} ${token}`;
  }
  return '';
}

export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

export function slashTrim(path: string) {
  return slash(path).replace(/(^\/)|(\/$)/, '');
}

export function microUrl(url: string, micro: string | string[]) {
  /* 前缀数组 */
  const arr: string[] = [];
  /* 去除默认 /api 前缀 */
  const trimUrl = url.replace(/^\/api\/(.*)/, '$1');
  arr.push(trimUrl);

  if (typeof micro === 'string') {
    arr.push(slashTrim(micro));
  } else {
    const paths: string[] = micro.map((m) => slashTrim(m));
    arr.push(...paths);
  }
  const result = arr.filter((p) => !!p).join('/');
  return `/${result}`;
}
