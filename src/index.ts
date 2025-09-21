import { HttpClientOptions } from "./config";
import { HttpClient } from "./client";
import { VERSION } from "./data";

class HttpClientStatic {
  private static client: HttpClient = HttpClientStatic.create();
  static version: string = VERSION;

  static create(opts?: HttpClientOptions): HttpClient {
    return new HttpClient(opts);
  }

  static get<R = any>(url: string): Promise<R>;
  static get<R = any>(opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static get<R = any>(url: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.client.get<R>(url as any, opts);
  }

  static post<R = any>(url: string): Promise<R>;
  static post<R = any>(opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static post<R = any>(url: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.client.post<R>(url as any, opts);
  }

  static put<R = any>(url: string): Promise<R>;
  static put<R = any>(opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static put<R = any>(url: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.client.put<R>(url as any, opts);
  }

  static delete<R = any>(url: string): Promise<R>;
  static delete<R = any>(opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static delete<R = any>(url: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.client.delete<R>(url as any, opts);
  }

  static options<R = any>(url: string): Promise<R>;
  static options<R = any>(opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string, opts: HttpClientOptions): Promise<R>;
  static options<R = any>(url: string | HttpClientOptions, opts?: HttpClientOptions): Promise<R> {
    return this.client.options<R>(url as any, opts);
  }
}

const http = HttpClientStatic;

export default http;
