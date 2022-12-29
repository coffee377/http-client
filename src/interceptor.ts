import { HttpRequest } from './request';
import { SafeAny } from './types';
import { HttpHandler } from './handler';
import { Observable } from 'rxjs';
import { HttpEvent } from './response';

export interface HttpInterceptor {
  intercept(request: HttpRequest<SafeAny>, next: HttpHandler): Observable<HttpEvent<SafeAny>>;
}

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private interceptor: HttpInterceptor, private next: HttpHandler) {}

  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    return this.interceptor.intercept(request, this.next);
  }
}
