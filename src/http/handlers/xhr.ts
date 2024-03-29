import { HttpAdapter } from '../handler';
import { HttpRequest } from '../request';
import { SafeAny } from '../../types';
import { catchError, concatMap, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ajax, AjaxError } from 'rxjs/ajax';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse, HttpResponseOptions } from '../response';
import { HttpHeaders } from '../headers';

export class HttpXhrAdapter extends HttpAdapter {
  private factory?: () => XMLHttpRequest;

  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    const responseOptions: HttpResponseOptions = {};

    return of({ type: HttpEventType.Sent }).pipe(
      /* 1. 发起请求 */
      concatMap((value) =>
        ajax({
          url: request.urlWithParams,
          method: request.method.toUpperCase() || 'GET',
          headers: request.headers.toObject(),
          body: request.serializeBody(),
          includeDownloadProgress: true,
          includeUploadProgress: true,
          queryParams: {},
          createXHR: this.factory,
          // ...request.context.get(FETCH_TOKEN),
        }),
      ),
      /* 2. 获取响应数据 */
      switchMap((value) => {
        responseOptions.url = value.request.url;
        responseOptions.status = value.status;
        Object.entries(value.responseHeaders).forEach(([k, v]) => {
          if (k && v) {
            if (!responseOptions.headers) {
              responseOptions.headers = new HttpHeaders();
            }
            responseOptions.headers.set(k, v);
          }
        });
        return of(value.response);
      }),
      /* 3. 响应结果封装 */
      map((body) => new HttpResponse(body, responseOptions)),
      /* 4. 错误处理 */
      catchError((err, caught) => {
        // return of(err);
        if (err instanceof HttpErrorResponse) {
          return throwError(() => err);
        } else if (err instanceof AjaxError) {
          if (err.response) {
            console.log(err.response);
            return of(err.response);
          }
        } else {
          return throwError(
            () =>
              new HttpErrorResponse({
                ...responseOptions,
                error: err,
              }),
          );
        }
      }),
    );
  }
}
