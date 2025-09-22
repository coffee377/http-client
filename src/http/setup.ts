import { HttpInterceptorFn } from "./interceptor";
import type { HttpHandler } from "./handler";
import { HttpFeatureKind } from "./feature";

interface HttpConfig {
  /** The default HTTP backend handler */
  // backend: HttpHandler;
  // interceptorFns: HttpInterceptorFn[];
}

type HttpSetupFeature =
  | { kind: HttpFeatureKind.Backend; value: HttpHandler }
  | { kind: HttpFeatureKind.XsrfProtection; value: HttpInterceptorFn };

export const config: HttpConfig = {
  // backend: withXhr().value,
  // interceptorFns: [],
};

export function setupHttpClient(...features: HttpSetupFeature[]) {
  for (const { kind, value } of features) {
    // switch (kind) {
    //   case HttpFeatureKind.Backend:
    //     config.backend = value;
    //     break;
    //
    //   case HttpFeatureKind.XsrfProtection:
    //     config.interceptorFns.push(value);
    //     break;
    // }
  }
}
