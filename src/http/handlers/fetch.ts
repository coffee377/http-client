import { HttpAdapter } from '../handler';
import { HttpRequest } from '../request';
import { SafeAny } from '../../types';
import { catchError, concatMap, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse, HttpResponseOptions } from '../response';
import { HttpContextToken } from '../../context';
import { HttpHeaders } from '../headers';
import { RequestOptions } from '../../config';

export const FETCH_TOKEN = new HttpContextToken<Omit<RequestInit, 'method' | 'headers' | 'body' | 'signal'>>(
  () => ({}),
);

export class FetchAdapter extends HttpAdapter {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    if (request.reportProgress) {
      throw Error('Fetch API does not currently support report progress');
    }

    const responseOptions: HttpResponseOptions = {};

    return of({ type: HttpEventType.Sent }).pipe(
      /* 1. 发起请求 */
      concatMap((value) =>
        fromFetch(request.urlWithParams, {
          method: request.method.toUpperCase() || 'GET',
          headers: request.headers.toObject(),
          body: request.serializeBody(),
          ...request.context.get(FETCH_TOKEN),
        }),
      ),
      /* 2. 获取响应数据 */
      switchMap((response) => {
        responseOptions.url = response.url;
        responseOptions.status = response.status;
        responseOptions.statusText = response.statusText;
        response.headers.forEach((value, key) => {
          if (!responseOptions.headers) {
            responseOptions.headers = new HttpHeaders();
          }
          responseOptions.headers.set(key, value);
        });

        switch (request.responseType) {
          case 'arrayBuffer':
            return from(response.arrayBuffer());
          case 'blob':
            return from(response.blob());
          case 'json':
            return from(response.json());
          case 'text':
            return from(response.text());
        }
      }),
      /* 3. 响应结果封装 */
      map((body) => new HttpResponse(body, responseOptions)),
      /* 4. 错误处理 */
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          return throwError(() => error);
        }

        return throwError(
          () =>
            new HttpErrorResponse({
              ...responseOptions,
              error: error,
            }),
        );
      }),
    );
  }
}
