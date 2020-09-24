import CD from 'cropduster';

export default class DataSource {
  key: string;
  sorcererUrlBase: string;
  miParams: Object;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase =
      'https://sorcerer.movableink-templates.com/data_sources';
    this.miParams = {
      latitude: 'mi_lat',
      longitude: 'mi_lon',
      includeHeaders: 'mi_include_headers',
      multiple: 'mi_multiple',
      radius: 'mi_radius',
      limit: 'mi_limit'
    };
  }

  /**
   *
   * @param params
   * @param options
   */
  async getRawData(params: object, options = {}) {
    const paramStr = Object.keys(params)
      .map((key) => {
        return key + '=' + params[key];
      })
      .join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;

    options['cacheTime'] = options['cacheTime'] || 10 * 1000;
    options['headers'] = options['headers'] || {};

    options['headers']['x-reverse-proxy-ttl'] = options['cacheTime'] / 1000;
    options['headers']['x-mi-cbe'] = CD._hashForRequest(url, options);

    return await CD.get(url, options);
  }

  /**
   *
   * @param params
   * @param opts
   */
  async getAllRows(params: object, opts = {}) {
    params['mi_multiple'] = true;

    if (opts['headers']) {
      params['mi_include_headers'] = true;
      opts['headers'] = {};
    }
    const { data } = await this.getRawData(params, opts);
    return JSON.parse(data);
  }

  /**
   *
   * @param opts
   */
  async getMultipleTargets(sets: any = [], opts: any = {}) {
    const params = {
      mi_multiple: true,
      mi_include_headers: true,
    };

    const options = {
      method: 'POST',
      body: JSON.stringify(sets)
    }

    Object.assign(options, opts);

    const { method = null } = options;
    if (!method && method.toLowerCase() !== 'post') {
      throw new Error('Request method must be POST for getMultipleTargets');
    }

    const { data } = await this.getRawData(params, options);
    return JSON.parse(data);
  }

  /**
   *
   * @param set
   * @param opts
   */
  async getSingleTarget(set: any = {}, opts: any = {}) {
    return await this.getMultipleTargets([set], opts);
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
