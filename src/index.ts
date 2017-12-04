import CD from 'cropduster';

export default class DataSource {
  key: string;
  sorcererUrlBase: string;

  constructor(key: string) {
    this.key = key;
    this.sorcererUrlBase = "https://sorcerer.movableink-templates.com/data_sources";
  }

  getRawData(params: object, cb: Function) {
    const paramStr = Object.keys(params).map(key => {
      return key + '=' + params[key];
    }).join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;

    return CD.get(url, {}, raw => cb(raw));
  }
}
