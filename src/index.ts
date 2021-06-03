import CD from 'cropduster';
import { CDResponse } from '../types/cropduster';

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

    options['cacheTime'] = options['cacheTime'] || 10 * 1000;
    options['headers'] = options['headers'] || {};

    options['headers']['x-reverse-proxy-ttl'] = options['cacheTime'] / 1000;
    options['headers']['x-mi-cbe'] = CD._hashForRequest(url, options);

    return CD.get(url, options);
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
