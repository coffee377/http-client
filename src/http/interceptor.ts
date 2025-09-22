import { HttpRequest } from "./request";
import { HttpHandler } from "./handler";
import { HttpEvent } from "./response";
import { SafeAny } from "../types";
import { Observable } from "rxjs";

export interface HttpInterceptor {
  intercept(request: HttpRequest<SafeAny>, next: HttpHandler): Observable<HttpEvent<SafeAny>>;
}

export type HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>>;

export type HttpHandlerFn = (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

type ChainedInterceptorFn<RequestT> = (
  req: HttpRequest<RequestT>,
  finalHandlerFn: HttpHandlerFn,
) => Observable<HttpEvent<RequestT>>;

function interceptorChainEndFn(
  req: HttpRequest<SafeAny>,
  finalHandlerFn: HttpHandlerFn,
): Observable<HttpEvent<SafeAny>> {
  return finalHandlerFn(req);
}

function adaptLegacyInterceptorToChain(
  chainTailFn: ChainedInterceptorFn<SafeAny>,
  interceptor: HttpInterceptor,
): ChainedInterceptorFn<SafeAny> {
  return (initialRequest, finalHandlerFn) =>
    interceptor.intercept(initialRequest, {
      handle: (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn),
    });
}

function chainedInterceptorFn(
  chainTailFn: ChainedInterceptorFn<unknown>,
  interceptorFn: HttpInterceptorFn,
): ChainedInterceptorFn<unknown> {
  return (initialRequest, finalHandlerFn) =>
    interceptorFn(initialRequest, (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn));
}

/**
 * Creates an `HttpInterceptorFn` which lazily initializes an interceptor chain from the legacy
 * class-based interceptors and runs the request through it.
 */
export function legacyInterceptorFnFactory(interceptors: HttpInterceptor[]): HttpInterceptorFn {
  let chain: ChainedInterceptorFn<SafeAny> | null = null;

  return (req, handler) => {
    if (chain === null) {
      // Note: interceptors are wrapped right-to-left so that final execution order is
      // left-to-right. That is, if `interceptors` is the array `[a, b, c]`, we want to
      // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
      // out.
      chain = interceptors.reduceRight(
        adaptLegacyInterceptorToChain,
        interceptorChainEndFn as ChainedInterceptorFn<SafeAny>,
      );
    }

    return chain(req, handler);
  };
}
