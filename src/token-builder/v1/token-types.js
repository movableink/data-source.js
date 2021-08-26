const REPLACE_CHAR_LIMIT = 100;
const ALLOWED_ALGOS = new Set(['sha256', 'sha1', 'md5']);
const ALLOWED_ENCODINGS = new Map([
  ['hex', 'hex'],
  ['base64', 'base64'],
  ['base64url', 'base64'],
  ['base64percent', 'base64'],
]);

export class TokenBase {
  constructor({ name, cacheOverride = null, skipCache = false }) {
    this.name = name;
    this.type = 'base';
    this.requiredProperties = ['name'];
    this.errors = [];
    this.cacheOverride = cacheOverride;
    this.skipCache = skipCache;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      cacheOverride: this.cacheOverride,
      skipCache: this.skipCache,
    };
  }

  validateOptions() {
    const missingProps = [];
    this.requiredProperties.forEach((prop) => {
      if (!this[prop]) {
        missingProps.push(prop);
      }
    });

    if (missingProps.length) {
      this.errors.push(`Missing properties for ${this.type} token: "${missingProps.join(', ')}"`);
    }
  }
}

export class ReplaceToken extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'replace';
    this.requiredProperties = ['name', 'value'];
    this.value = params.value;

    this.validateOptions();
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      value: this.value,
      cacheOverride: this.cacheOverride,
      skipCache: this.skipCache,
    };
  }

  validateOptions = () => {
    super.validateOptions();

    if (this.value && this.value.length > REPLACE_CHAR_LIMIT) {
      this.errors.push(`Replace value exceeds ${REPLACE_CHAR_LIMIT} character limit`);
    }
  };
}

export class HmacToken extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'hmac';
    this.hmacOptions = params.options;
    this.validateOptions();
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      cacheOverride: this.cacheOverride,
      skipCache: this.skipCache,
      options: this.hmacOptions,
    };
  }

  validateOptions() {
    super.validateOptions();

    if (!ALLOWED_ALGOS.has(this.hmacOptions.algorithm)) {
      this.errors.push('HMAC algorithm is invalid');
    }

    if (!this.hmacOptions.secretName) {
      this.errors.push('HMAC secret name not provided');
    }

    if (!ALLOWED_ENCODINGS.has(this.hmacOptions.encoding)) {
      this.errors.push('HMAC encoding is invalid');
    }
  }
}

export class RequestBuilder {
  constructor(tokens) {
    this.tokens = tokens || [];
  }

  toJSON() {
    //TODO: how do we get the current version?
    const payload = { tokenApiVersion: '1', tokens: [] };
    const errors = [];

    this.tokens.forEach((token, index) => {
      if (token.errors.length) {
        errors.push(`token ${index + 1}: ${token.errors.join(', ')}.`);
      } else {
        payload.tokens.push(token.toJSON());
      }
    });

    if (errors.length) {
      throw new Error(`Errors found while parsing tokens:\n${errors.join('\n')}`);
    }

    return payload;
  }
}
