import CD from 'cropduster';

export default class DataSource {
  key: string;
  sorcererUrlBase: string;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase = "https://sorcerer.movableink-templates.com/data_sources";
  }

  getRawData(params: object, cb?: Function) {
    const paramStr = Object.keys(params).map(key => {
      return key + '=' + params[key];
    }).join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;
    const options = {
      corsCacheTime : 10 * 1000,
      headers : {}
    };

    options.headers['x-reverse-proxy-ttl'] =  options.corsCacheTime / 1000;
    options.headers['x-mi-cbe'] = CD._hashForRequest(url, options);

    return CD.get(url, options, cb);
  }

  getAllRows(params: object, opts = {}) {
    params['mi_multiple'] = true;

    if (opts['headers']) {
      params['mi_include_headers'] = true;
    }

    return this.getRawData(params).then(function(response) {
      return JSON.parse(response.data);
    });
  }
}
