/**
 * 获取令牌
 * @param opts 令牌参数
 */
import { RequestOptions, TokenOptions } from './types';

/**
 * 获取令牌
 * @param opts
 */
export function getToken(opts?: TokenOptions): string {
    const {key = 'Authorization', storage = 'local', bearer, prefix} = opts ?? {};
    const sto = storage == 'session' ? sessionStorage : localStorage;
    const token = sto.getItem(key)?.replace(/["'](.*)["']/, '$1') || '';
    if (!!token && bearer) {
        return `bearer ${token}`;
    } else if (!!token && !!prefix) {
        return `${prefix} ${token}`;
    }
    return '';
}

/**
 * 规范路径分隔符
 * @param path
 */
export function slash(path: string) {
    const isExtendedLengthPath = /^\\\\\?\\/.test(path);
    const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex

    if (isExtendedLengthPath || hasNonAscii) {
        return path;
    }

    return path.replace(/\\/g, '/');
}

/**
 * 去除前后路径符号
 * @param path
 */
export function slashTrim(path: string) {
    return slash(path).replace(/(^\/)|(\/$)/, '');
}

/**
 * 微服务前缀 url
 * @param url 原始 url
 * @param micro 微服务
 */
export function trimApiPrefixUrl(url: string, micro?: string | string[]) {
    /* 前缀数组 */
    const arr: string[] = [];
    /* 去除默认 /api 前缀 */
    const trimUrl = url.replace(/^\/api\/(.*)/, '$1');
    arr.push(trimUrl);

    if (typeof micro === 'string') {
        arr.push(slashTrim(micro));
    } else if (typeof micro == 'object') {
        const paths: string[] = micro.map((m) => slashTrim(m));
        arr.push(...paths);
    }
    const result = arr.filter((p) => !!p).join('/');
    return `/${result}`;
}

/**
 * 参数转换
 * @param service
 * @param options
 */
export function transformParams(service: string | RequestOptions, options: RequestOptions = {}): RequestOptions {
    let opts: RequestOptions = {};
    if (arguments.length === 1 && typeof service === 'string') {
        opts.url = service;
    } else if (arguments.length === 1 && typeof service !== 'string') {
        opts = service;
    } else if (arguments.length === 2) {
        opts = Object.assign({}, options, {url: service});
    }
    return opts;
}
