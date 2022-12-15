import { GlobalHttpClientConfiguration, HttpClientOptions } from './types';
import { VERSION } from './data';
import { HttpClient } from './client';

export interface Window {
  __HTTP_CLIENT_CONFIG__: GlobalHttpClientConfiguration;
}

export interface RequestInstance extends HttpClient {}

export interface RequestStatic extends RequestInstance {
  create(opts?: HttpClientOptions): RequestInstance;

  // static dd():string
}

class HttpClientStatic {
  static client: HttpClient = HttpClientStatic.create();
  static name: string = 'request';
  static version: string = VERSION;

  static create(opts?: HttpClientOptions): HttpClient {
    return new HttpClient(opts);
  }

  static get<R = any>(url: string): Promise<R>;
  static get<R = any>(opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.get(url as any, opts);
  }

  static post<R = any>(url: string): Promise<R>;
  static post<R = any>(opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.post(url as any, opts);
  }

  static put<R = any>(url: string): Promise<R>;
  static put<R = any>(opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.put(url as any, opts);
  }

  static delete<R = any>(url: string): Promise<R>;
  static delete<R = any>(opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.delete(url as any, opts);
  }

  static options<R = any>(url: string): Promise<R>;
  static options<R = any>(opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string | HttpClientOptions, opts: HttpClientOptions): Promise<R> {
    return this.client.options(url as any, opts);
  }
}

const request = HttpClientStatic;

export default request;
