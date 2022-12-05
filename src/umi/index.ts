import { RequestOptionsInit } from 'umi-request';
import { HttpClientOptions } from '../types';

export interface UmiRequestOptions extends Omit<RequestOptionsInit, ['prefix', 'headers']>, HttpClientOptions {}
