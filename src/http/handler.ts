import { HttpRequest } from './request';
import { SafeAny } from '../types';
import { HttpEvent } from './response';
import { lastValueFrom, Observable } from 'rxjs';

export interface HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}

export abstract class HttpAdapter implements HttpHandler {
  promise(request: HttpRequest<SafeAny>): Promise<SafeAny> {
    const observable = this.handle(request);
    observable.subscribe((res) => {
      console.log('subscribe >>>> ', res);
    });
    return lastValueFrom(observable);
  }

  abstract handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}
