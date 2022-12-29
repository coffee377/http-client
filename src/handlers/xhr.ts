import { HttpAdapter } from '../handler';
import { HttpRequest } from '../request';
import { SafeAny } from '../types';
import { Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { HttpEvent } from '../response';

export class HttpXhrAdapter extends HttpAdapter {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    const result = ajax({ url: '', method: '' });
    return result;
  }
}
