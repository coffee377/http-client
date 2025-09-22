export const HttpStatusMessage = {
  200: "服务器成功返回请求的数据",
  201: "新建或修改数据成功",
  202: "一个请求已经进入后台排队（异步任务）",
  204: "删除数据成功",
  400: "发出的请求有错误，服务器没有进行新建或修改数据的操作",
  401: "未认证的用户",
  403: "没有访问权限",
  404: "发出的请求针对的是不存在的记录，服务器没有进行操作",
  406: "请求的格式不可得",
  410: "请求的资源被永久删除，且不会再得到的",
  412: "无效的认证信息",
  422: "当创建一个对象时，发生一个验证错误",
  500: "服务器发生错误，请检查服务器",
  502: "网关错误",
  503: "服务不可用，服务器暂时过载或维护",
  504: "网关超时",
};
/**
 * HTTP Error
 * HTTP错误
 * @param {number} status  返回的 HTTP 状态码
 * @param {string} message Error 必备属性
 */
export class HttpError extends Error {
  url: string;
  method: string;
  status: number;
  constructor(url: string, method: string, status: number, message?: string) {
    super(message);
    this.name = "HttpError";
    this.url = url;
    this.method = method;
    this.status = status;
    if (message) {
      this.message = message;
    } else {
      this.message = HttpStatusMessage[this.status];
    }
  }
}
/**
 * Interface Error
 * 接口错误
 * @param {string | number} code 返回的接口响应状态码
 * @param {string} message 返回的接口响应提示语
 */
export class InterfaceError extends Error {
  url: string;
  method: string;
  code: string | number;
  constructor(url: string, method: string, code: string | number, message: string) {
    super(message);
    this.name = "InterfaceError";
    this.url = url;
    this.method = method;
    this.code = code;
  }
}

/**
 * 未认证
 * @since 0.2.4
 */
export class UnauthorizedError extends HttpError {
  constructor(url: string, method: string, message?: string) {
    super(url, method, 401, message);
    this.name = "Unauthorized";
  }
}

/**
 * 没有访问权限
 * @since 0.2.4
 */
export class ForbiddenError extends HttpError {
  constructor(url: string, method: string, message?: string) {
    super(url, method, 403, message);
    this.name = "Forbidden";
  }
}

/**
 * NotFound
 * @since 0.2.4
 */
export class NotFoundError extends HttpError {
  constructor(url, method, message) {
    super(url, method, 404, message);
    this.name = "NotFound";
  }
}

/**
 * InvalidToken
 * @since 0.2.4
 */
export class InvalidTokenError extends HttpError {
  constructor(url: string, method: string, message?: string) {
    super(url, method, 412, message);
    this.name = "InvalidToken";
  }
}
