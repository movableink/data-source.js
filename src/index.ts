import CD from 'cropduster';

interface Mapping {
  key: string;
  originKey: string;
}

export default class DataSource {
  key: string;
  sorcererUrlBase: string;
  mappings: Mapping[];

  constructor(key: string, map: Mapping[]) {
    this.key = key;
    this.sorcererUrlBase = 'http://localhost:9292/data_sources';
    this.mappings = map;
  }

  getObjectPath(obj: any, pathParts: string[]) {
    if (!pathParts.length) {
      return obj;
    } else {
      const currentKey = pathParts.shift();
      const value = obj[currentKey];

      return value ? this.getObjectPath(value, pathParts) : null;
    }
  }

  get(obj: any, path: string) {
    const parts = path.split('.');

    return this.getObjectPath(obj, parts);
  }

  mapData(data: any, mapping: Mapping[]) {
    const returnObj = {};
    const parsedData = JSON.parse(data);

    mapping.forEach(mapping => {
      returnObj[mapping.key] = this.get(parsedData, mapping.originKey);
    });

    return returnObj;
  }

  getData(params: object, cb: Function) {
    const paramStr = Object.keys(params).map(key => {
      return key + '=' + params[key];
    }).join('&');

    const url = `${this.sorcererUrlBase}/${this.key}?${paramStr}`;

    return CD.get(url, {}, raw => cb(this.mapData(raw, this.mappings)));
  }
}
