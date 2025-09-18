import { describe, expect, test } from '@jest/globals';
import { HttpRequest } from '../http/request';
import { HttpHeaders } from '../http/headers';
import { HttpParams } from '../http/params';
import { HttpContext } from '../context';

const TEST_URL = 'https://angular.io/';
const TEST_STRING = `I'm a body!`;

describe('HttpRequest', () => {
  describe('constructor', () => {
    test('initializes url', () => {
      const req = new HttpRequest('GET', TEST_URL);
      expect(req.url).toBe(TEST_URL);
    });
    test("doesn't require a body for body-less methods", () => {
      let req = new HttpRequest('GET', TEST_URL);
      expect(req.method).toBe('GET');
      expect(req.body).toBeNull();
      req = new HttpRequest('HEAD', TEST_URL);
      expect(req.method).toBe('HEAD');
      expect(req.body).toBeNull();
      req = new HttpRequest('OPTIONS', TEST_URL);
      expect(req.method).toBe('OPTIONS');
      expect(req.body).toBeNull();
    });
    test('accepts a string body', () => {
      const req = new HttpRequest('POST', TEST_URL, { body: TEST_STRING });
      expect(req.body).toBe(TEST_STRING);
    });
    test('accepts an object body', () => {
      const req = new HttpRequest('POST', TEST_URL, { body: { data: TEST_STRING } });
      expect(req.body).toEqual({ data: TEST_STRING });
    });
    test('creates default headers if not passed', () => {
      const req = new HttpRequest('GET', TEST_URL);
      expect(req.headers instanceof HttpHeaders).toBeTruthy();
    });
    test('uses the provided headers if passed', () => {
      const headers = new HttpHeaders();
      const req = new HttpRequest('GET', TEST_URL, { headers });
      expect(req.headers).toBe(headers);
    });
    test('uses the provided context if passed', () => {
      const context = new HttpContext();
      const req = new HttpRequest('GET', TEST_URL, { context });
      expect(req.context).toBe(context);
    });
    test('defaults to Json', () => {
      const req = new HttpRequest('GET', TEST_URL);
      expect(req.responseType).toBe('json');
    });
  });
  describe('clone() copies the request', () => {
    const headers = new HttpHeaders({
      Test: 'Test header',
    });
    const context = new HttpContext();
    const req = new HttpRequest('POST', TEST_URL, {
      body: 'test body',
      headers,
      context,
      reportProgress: true,
      responseType: 'text',
      withCredentials: true,
    });
    test('in the base case', () => {
      const clone = req.clone();
      expect(clone.method).toBe('POST');
      expect(clone.responseType).toBe('text');
      expect(clone.url).toBe(TEST_URL);
      // Headers should be the same, as the headers are sealed.
      expect(clone.headers).toBe(headers);
      expect(clone.headers.get('Test')).toBe('Test header');

      expect(clone.context).toBe(context);
    });
    test('and updates the url', () => {
      expect(req.clone({ url: '/changed' }).url).toBe('/changed');
    });
    test('and updates the method', () => {
      expect(req.clone({ method: 'PUT' }).method).toBe('PUT');
    });
    test('and updates the body', () => {
      expect(req.clone({ body: 'changed body' }).body).toBe('changed body');
    });
    test('and updates the context', () => {
      const newContext = new HttpContext();
      expect(req.clone({ context: newContext }).context).toBe(newContext);
    });
  });
  describe('content type detection', () => {
    const baseReq = new HttpRequest('POST', '/test');
    test('handles a null body', () => {
      expect(baseReq.detectContentTypeHeader()).toBeNull();
    });
    test("doesn't associate a content type with ArrayBuffers", () => {
      const req = baseReq.clone({ body: new ArrayBuffer(4) });
      expect(req.detectContentTypeHeader()).toBeNull();
    });
    test('handles strings as text', () => {
      const req = baseReq.clone({ body: 'hello world' });
      expect(req.detectContentTypeHeader()).toBe('text/plain');
    });
    test('handles arrays as json', () => {
      const req = baseReq.clone({ body: ['a', 'b'] });
      expect(req.detectContentTypeHeader()).toBe('application/json');
    });
    test('handles numbers as json', () => {
      const req = baseReq.clone({ body: 314159 });
      expect(req.detectContentTypeHeader()).toBe('application/json');
    });
    test('handles objects as json', () => {
      const req = baseReq.clone({ body: { data: 'test data' } });
      expect(req.detectContentTypeHeader()).toBe('application/json');
    });
    test('handles boolean as json', () => {
      const req = baseReq.clone({ body: true });
      expect(req.detectContentTypeHeader()).toBe('application/json');
    });
  });
  describe('body serialization', () => {
    const baseReq = new HttpRequest('POST', '/test');
    test('handles a null body', () => {
      expect(baseReq.serializeBody()).toBeNull();
    });
    test('passes ArrayBuffers through', () => {
      const body = new ArrayBuffer(4);
      expect(baseReq.clone({ body }).serializeBody()).toBe(body);
    });
    test('passes URLSearchParams through', () => {
      const body = new URLSearchParams('foo=1&bar=2');
      expect(baseReq.clone({ body }).serializeBody()).toBe(body);
    });
    test('passes strings through', () => {
      const body = 'hello world';
      expect(baseReq.clone({ body }).serializeBody()).toBe(body);
    });
    test('serializes arrays as json', () => {
      expect(baseReq.clone({ body: ['a', 'b'] }).serializeBody()).toBe('["a","b"]');
    });
    test('handles numbers as json', () => {
      expect(baseReq.clone({ body: 314159 }).serializeBody()).toBe('314159');
    });
    test('handles objects as json', () => {
      const req = baseReq.clone({ body: { data: 'test data' } });
      expect(req.serializeBody()).toBe('{"data":"test data"}');
    });
    test('serializes parameters as urlencoded', () => {
      const params = new HttpParams().append('first', 'value').append('second', 'other');
      const withParams = baseReq.clone({ body: params });
      expect(withParams.serializeBody()).toEqual('first=value&second=other');
      expect(withParams.detectContentTypeHeader()).toEqual('application/x-www-form-urlencoded;charset=UTF-8');
    });
  });
  describe('parameter handling', () => {
    const baseReq = new HttpRequest('GET', '/test');
    const params = new HttpParams('test=true');
    test('appends parameters to a base URL', () => {
      const req = baseReq.clone({ params });
      expect(req.urlWithParams).toEqual('/test?test=true');
    });
    test('appends parameters to a URL with an empty query string', () => {
      const req = baseReq.clone({ params, url: '/test?' });
      expect(req.urlWithParams).toEqual('/test?test=true');
    });
    test('appends parameters to a URL with a query string', () => {
      const req = baseReq.clone({ params, url: '/test?other=false' });
      expect(req.urlWithParams).toEqual('/test?other=false&test=true');
    });
    test('sets parameters via setParams', () => {
      const req = baseReq.clone({ params: baseReq.params.set('test', 'false') });
      expect(req.urlWithParams).toEqual('/test?test=false');
    });
  });
});
