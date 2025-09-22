import { HttpInterceptor, HttpInterceptorFn } from "./interceptor";
import type { HttpHandler } from "./handler";

export enum HttpFeatureKind {
  Backend,
  Interceptors,
  XsrfProtection,
  LegacyInterceptors,
}

export type HttpFeature =
  | { kind: HttpFeatureKind.Backend; value: HttpHandler }
  | { kind: HttpFeatureKind.Interceptors; value: HttpInterceptorFn[] }
  | { kind: HttpFeatureKind.LegacyInterceptors; value: HttpInterceptor[] }
  | { kind: HttpFeatureKind.XsrfProtection; value: HttpInterceptorFn };

// export function withXhr(factory?: () => XMLHttpRequest) {
//   return { kind: HttpFeatureKind.Backend, value: new HttpXhr(factory) };
// }
//
// export function withFetch(fetchImpl?: typeof fetch) {
//   return { kind: HttpFeatureKind.Backend, value: new Fetch(fetchImpl) };
// }
//
// export function withInterceptors(interceptorFns: HttpInterceptorFn[]): HttpFeature {
//   return { kind: HttpFeatureKind.Interceptors, value: interceptorFns };
// }

// export function withXsrfProtection(options?: {
//   cookieName?: string;
//   headerName?: string;
//   tokenExtractor?: () => string | null;
// }) {
//   return {
//     kind: HttpFeatureKind.XsrfProtection,
//     value: xsrfInterceptor(options),
//   } as const;
// }
