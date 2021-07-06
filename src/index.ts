import CD from 'cropduster';
import { CDResponse } from '../types/cropduster';

const TOKEN_API_VERSION = '1.1.0';

interface Token {
  name: string;
  cacheOverride?: string;
}

interface TokenOptions {}

interface TokenJSON {
  name: string;
  path?: string;
  value?: string;
  options?: TokenOptions;
}

interface TokenRequest {
  tokenAPIVersion: string;
  tokens: TokenJSON[];
}

export class RequestBuilder {
  tokens;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  asJSON(): TokenJSON[] {
    return this.tokens.map((token) => {
      token.validate();
      return token.computedValue;
    });
  }

  toJSON(): TokenRequest {
    return { tokenAPIVersion: TOKEN_API_VERSION, tokens: this.asJSON() };
  }
}

export interface TargetingParams {
  [key: string]: string | number | Object[] | Object;
}

function buildTokens(tokens) {
  return tokens.map((token) => {
    token.validate();

    return token.computedValue;
  });
}

export class TokenBase {
  options = null;
  requiredProperties = ['name', 'type'];
  computedValue;
  type = null;

  constructor(options) {
    this.options = options;
    // this.validate() // we could potentially run validations whenever we instantiate a new token
  }

  validate() {
    const missingProps = [];
    this.requiredProperties.forEach((prop) => {
      if (!this.options[prop]) {
        missingProps.push(prop);
      }
    });

    if (missingProps.length) {
      throw new Error(
        `Invalid properties for ${this.type} token:: "${missingProps.join(', ')}" is missing`
      );
    }
  }
}

export class ReplaceToken extends TokenBase {
  requiredProperties = ['name', 'value'];

  constructor(options) {
    super(options);
  }

  computedValue = {
    name: this.options.name,
    value: this.options.value,
    type: 'replace',
  };
}

export class HmacToken extends TokenBase {
  requiredProperties = ['name', 'secretName', 'stringToSign', 'algorithm', 'encoding'];

  constructor(options) {
    super(options);
  }

  computedValue = {
    name: this.options.name,
    options: {
      algorithm: this.options.algorithm,
      encoding: this.options.encoding,
      secretName: this.options.secretName,
      stringToSign: this.options.stringToSign,
    },
    type: 'hmac',
  };
}

export default class DataSource {
  key: string;
  sorcererUrlBase: string;
  miParams: Object;
  tokens: Token[];

  constructor(key: string, tokens: Token[]) {
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
    this.tokens = buildTokens(tokens);
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
