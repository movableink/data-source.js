const ALLOWED_ALGOS = new Set(['sha256', 'sha1', 'md5']);
const ALLOWED_ENCODINGS = new Set(['hex', 'base64', 'base64url', 'base64percent']);

export const REPLACE_CHAR_LIMIT = 100;

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
    this.requiredProperties = [...this.requiredProperties, 'value'];
    this.value = params.value;

    this.validateOptions();
  }

  toJSON() {
    const json = super.toJSON();

    return { ...json, value: this.value };
  }

  validateOptions = () => {
    super.validateOptions();

    if (this.value && this.value.length > REPLACE_CHAR_LIMIT) {
      this.errors.push(`Replace value exceeds ${REPLACE_CHAR_LIMIT} character limit`);
    }
  };
}

export class ReplaceLargeToken extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'replaceLarge';
    this.requiredProperties = [...this.requiredProperties, 'value'];
    this.value = params.value;

    this.validateOptions();
  }

  toJSON() {
    const json = super.toJSON();

    return { ...json, value: this.value };
  }

  validateOptions() {
    super.validateOptions();

    if (this.value && this.value.length <= REPLACE_CHAR_LIMIT) {
      this.errors.push(
        `ReplaceLarge token can only be used when value exceeds ${REPLACE_CHAR_LIMIT} character limit`
      );
    }
  }
}

export class SecretToken extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'secret';
    this.requiredProperties = [...this.requiredProperties, 'path'];
    this.path = params.path;
    this.validateOptions();
  }

  toJSON() {
    const json = super.toJSON();

    return { ...json, path: this.path };
  }
}

export class HmacToken extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'hmac';
    this.hmacOptions = params.options || {};
    this.validateOptions();
  }

  toJSON() {
    const json = super.toJSON();

    return { ...json, options: this.hmacOptions };
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

export class Sha1Token extends TokenBase {
  constructor(params) {
    super(params);
    this.type = 'sha1';
    this.options = params.options || {};
    this.validateOptions();
  }

  toJSON() {
    const json = super.toJSON();

    return { ...json, options: this.options };
  }

  hasInvalidSecrets() {
    if (!Array.isArray(this.options.tokens) || !this.options.tokens.length) {
      return false;
    }

    for (let token of this.options.tokens) {
      if (token.type !== 'secret' || !token.path) {
        return true;
      }
    }

    return false;
  }

  validateOptions() {
    super.validateOptions();

    if (!this.options.text) {
      this.errors.push('Missing text to encrypt');
    }

    if (this.options.encoding !== 'hex' && this.options.encoding !== 'base64') {
      this.errors.push('SHA1 encoding is invalid');
    }

    if (this.hasInvalidSecrets()) {
      this.errors.push('Invalid secret token passed into SHA1 tokens array');
    }
  }
}
