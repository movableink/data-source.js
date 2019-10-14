import CD from 'cropduster';

export default class DataSource {
  key: string;
  sorcererUrlBase: string;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase =
      'https://sorcerer.movableink-templates.com/data_sources';
  }

  getRawData(params: object, options = {}, cb?: Function) {
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    const paramStr = Object.keys(params)
      .map((key) => {
        return key + '=' + params[key];
      })
      .join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;

    options['corsCacheTime'] = options['corsCacheTime'] || 10 * 1000;
    options['headers'] = options['headers'] || {};

    options['headers']['x-reverse-proxy-ttl'] = options['corsCacheTime'] / 1000;
    options['headers']['x-mi-cbe'] = CD._hashForRequest(url, options);

    console.log(options);

    return CD.get(url, options, cb);
  }

  getAllRows(params: object, opts = {}) {
    params['mi_multiple'] = true;

    if (opts['headers']) {
      params['mi_include_headers'] = true;
      opts['headers'] = {};
    }

    return this.getRawData(params, opts).then(function(response) {
      return JSON.parse(response.data);
    });
  }
}
