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
  [key: string]: string | number | Object[] | Object;
}

export default class DataSource {
  key: string;
  sorcererUrlBase: string;
  miParams: Object;

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
  getRawData(params: TargetingParams, options = {}): Promise<CDResponse> {
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

    options['headers']['x-reverse-proxy-ttl'] = options['cacheTime'] / 1000;
    options['headers']['x-mi-cbe'] = isTokenBuilder
      ? this.generateTokenBuilderHash(options)
      : this.generateHash(params, options);

    return CD.get(url, options);
  }

  /**
   *
   * @param options
   */
  generateTokenBuilderHash(options = {}): number | string {
    options = structuredClone(options);
    const { tokenApiVersion, tokens = [] } = JSON.parse(options['body']);

    const cacheFragments = tokens.reduce((acc, token) => {
      if (!token.skipCache) {
        const keyPair = {};
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
  generateHash(params: TargetingParams, options = {}): number | string {
    params = structuredClone(params); // don't want to modify original params
    const ignoredParams = options['headers']['x-cache-ignore-query-params'] || '';

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
  async getMultipleTargets(opts: any = {}) {
    const params = {
      mi_multiple: true,
      mi_include_headers: true,
    };

    const { method = null } = opts;
    if (!method && method.toLowerCase() !== 'post') {
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
  async getLocationTargets(params: any = {}, opts: any = {}) {
    const queryParams = {
      mi_multiple: true,
      mi_include_headers: true,
    };

    for (const key in params) {
      const paramName = this.miParams[key];
      if (paramName) {
        queryParams[paramName] = params[key];
      } else {
        queryParams[key] = params[key];
      }
    }

    const { data } = await this.getRawData(queryParams, opts);
    return JSON.parse(data);
  }
}
