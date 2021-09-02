export class RequestBuilder {
  constructor(tokens) {
    this.tokens = tokens || [];
    this.tokenApiVersion = 'V1';
  }

  toJSON() {
    const payload = { tokenApiVersion: this.tokenApiVersion, tokens: [] };
    const errors = [];

    this.tokens.forEach((token, index) => {
      if (token.errors.length) {
        errors.push(`token ${index + 1}: ${token.errors.join(', ')}`);
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
