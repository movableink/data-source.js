import CD from 'cropduster';
import { CDResponse } from '../types/cropduster';
export { RequestBuilder } from './token-builder/request-builder';
export {
  ReplaceToken,
  ReplaceLargeToken,
  SecretToken,
  HmacToken,
  RsaToken,
  Sha1Token,
} from './token-builder/types';

export interface TargetingParams {
  [key: string]: string | number | unknown;
}

export interface RequestParams {
  [key: string]: string;
}

export interface RequestOptions {
  headers?: RequestHeaders;
  cacheTime?: number;
  method?: string;
  body?: string;
}

export interface RequestHeaders {
  [key: string]: string;
}

export interface KeyPair {
  [key: string]: string | undefined;
}

export interface TokenHMACOptions {
  algorithm: string;
  secretValue: string;
  encoding: string;
}

export interface TokenRSAOptions {
  algorithm: string;
  secretValue: string;
  encoding: string;
}

export interface TokenSHA1Options {
  text: string;
  encoding: string;
  tokens?: TokenSHA1SecretToken[];
}

export interface TokenSHA1SecretToken {
  name: string;
  path: string;
}

export interface Token {
  name: string;
  type: string;
  cacheOverride?: string;
  skipCache?: boolean;
  value?: string;
  options?: TokenHMACOptions | TokenRSAOptions | TokenSHA1Options;
}

export default class DataSource {
  key: string;
  sorcererUrlBase: string;
  miParams: RequestParams;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase = 'https://sorcerer.movableink-templates.com/data_sources';
    this.miParams = {
      latitude: 'mi_lat',
      longitude: 'mi_lon',
      includeHeaders: 'mi_include_headers',
      multiple: 'mi_multiple',
      radius: 'mi_radius',
      limit: 'mi_limit',
    };
  }

  /**
   *
   * @param params
   * @param options
   */
  getRawData(params: TargetingParams, options: RequestOptions = {}): Promise<CDResponse> {
    const paramStr = Object.keys(params)
      .map((key) => {
        const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
        return key + '=' + value;
      })
      .join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;
    const isTokenBuilder = options['body'] && JSON.parse(options['body']).tokenApiVersion;

    options['cacheTime'] = options['cacheTime'] || 10 * 1000;
    options['headers'] = options['headers'] || {};

    options['headers']['x-reverse-proxy-ttl'] = (options['cacheTime'] / 1000).toString();
    options['headers']['x-mi-cbe'] = isTokenBuilder
      ? this.generateTokenBuilderHash(options).toString()
      : this.generateHash(params, options).toString();

    return CD.get(url, options, null);
  }

  /**
   *
   * @param options
   */
  generateTokenBuilderHash(options: RequestOptions = {}): number | string {
    options = structuredClone(options);
    const { tokenApiVersion, tokens = [] } = JSON.parse(options['body'] || '{}');

    const cacheFragments = tokens.reduce((acc: KeyPair[], token: Token) => {
      if (!token.skipCache) {
        const keyPair: KeyPair = {};
        const { cacheOverride, value, name } = token;
        keyPair[name] = cacheOverride || value;
        acc.push(keyPair);
      }
      return acc;
    }, []);

    options['body'] = JSON.stringify({ tokenApiVersion, tokens: cacheFragments });

    const cacheString = `${this.key}${JSON.stringify(options)}`;

    return this.hashString(cacheString);
  }

  /**
   *
   * @param params
   * @param options
   */
  generateHash(params: TargetingParams, options: RequestOptions = {}): number | string {
    params = structuredClone(params); // don't want to modify original params
    const ignoredParams =
      (options['headers'] && options['headers']['x-cache-ignore-query-params']) || '';

    for (const param of ignoredParams.split(',')) {
      delete params[param];
    }
    const cacheString = `${this.key}${JSON.stringify(params)}${JSON.stringify(options)}`;

    return this.hashString(cacheString);
  }

  /**
   *
   * @param str
   */
  hashString(cacheString: string): number | string {
    let hash = 0;
    if (cacheString.length === 0) return hash;

    for (let i = 0; i < cacheString.length; i++) {
      hash = ((hash << 5) - hash + cacheString.charCodeAt(i)) & 0xffffffff;
    }

    return hash.toString();
  }

  /**
   *
   * @param opts
   */
  async getMultipleTargets(opts: RequestOptions = {}): Promise<unknown> {
    const params = {
      mi_multiple: true,
      mi_include_headers: true,
    };

    const { method = null } = opts;
    // FIXME: logic error
    if (!method && method?.toLowerCase() !== 'post') {
      throw new Error('Request method must be POST for getMultipleTargets');
    }

    const { data } = await this.getRawData(params, opts);
    return JSON.parse(data);
  }

  /**
   *
   * @param params
   * @param opts
   */
  async getLocationTargets(
    params: TargetingParams = {},
    opts: RequestOptions = {}
  ): Promise<unknown> {
    const queryParams: RequestParams = {
      mi_multiple: 'true',
      mi_include_headers: 'true',
    };

    for (const key in params) {
      const paramName: string = this.miParams[key];
      if (paramName) {
        queryParams[paramName] = params[key] + '';
      } else {
        queryParams[key] = params[key] + '';
      }
    }

    const { data } = await this.getRawData(queryParams, opts);
    return JSON.parse(data);
  }
}
