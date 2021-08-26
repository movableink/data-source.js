const REPLACE_CHAR_LIMIT = 100;

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
