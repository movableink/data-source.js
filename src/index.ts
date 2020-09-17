import CD from 'cropduster';

export default class DataSource {
  key: string;
  sorcererUrlBase: string;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase =
      'https://sorcerer.movableink-templates.com/data_sources';
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
  async getMultipleRows(opts: any = {}) {
    const params = {
      mi_multiple: true,
      mi_include_headers: true,
    };

    const { method = null } = opts;

    if (!method && method.toLowerCase() !== 'post') {
      throw new Error('Request method must be POST for getMultipleRows');
    }

    const { data } = await this.getRawData(params, opts);
    return JSON.parse(data);
  }
}
