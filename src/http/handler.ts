import { HttpMethod, HttpRequest } from "./request";
import { lastValueFrom, Observable } from "rxjs";
import { RequestOptions } from "@/config";
import { HttpEvent } from "./response";
import { SafeAny } from "@/types";

export interface HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}

export abstract class HttpAdapter implements HttpHandler {
  promise<T>(request: HttpRequest<SafeAny>): Promise<SafeAny> {
    const observable = this.handle<T>(request);
    observable.subscribe((res) => {
      console.log("subscribe >>>> ", res);
    });
    return lastValueFrom(observable);
  }

  abstract handle<T>(request: HttpRequest<SafeAny>): Observable<T>;
}
