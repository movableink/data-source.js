import {
  TokenBase,
  ReplaceToken,
  HmacToken,
  RequestBuilder,
} from '../src/token-builder/v1/token-types';

const { test, module } = QUnit;

module('token builder v1', function () {
  module('TokenBase', function () {
    test('can be instantiated with all options', (assert) => {
      const options = {
        name: 'FavoriteBand',
        cacheOverride: 'Movable Band',
        skipCache: true,
      };

      const tokenModel = new TokenBase(options);

      const expectedJson = {
        name: 'FavoriteBand',
        type: 'base',
        cacheOverride: 'Movable Band',
        skipCache: true,
      };
      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('can be instantiated with default options', (assert) => {
      const options = {
        name: 'FavoriteBand',
      };

      const tokenModel = new TokenBase(options);

      const expectedJson = {
        name: 'FavoriteBand',
        type: 'base',
        cacheOverride: null,
        skipCache: false,
      };
      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('will include an error if instantiated with missing options and validateOptions is called', (assert) => {
      const tokenModel = new TokenBase({});
      tokenModel.validateOptions();

      assert.equal(tokenModel.errors.length, 1);
      assert.equal(tokenModel.errors[0], 'Missing properties for base token: "name"');
    });
  });

  module('ReplaceToken', function () {
    test('can be instantiated with all options', (assert) => {
      const options = {
        name: 'FavoriteBand',
        cacheOverride: 'Movable Band',
        value: 'Beatles',
        skipCache: true,
      };

      const tokenModel = new ReplaceToken(options);

      const expectedJson = {
        name: 'FavoriteBand',
        type: 'replace',
        cacheOverride: 'Movable Band',
        skipCache: true,
        value: 'Beatles',
      };
      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('can be instantiated with default options', (assert) => {
      const options = {
        name: 'FavoriteBand',
        value: 'Beatles',
      };

      const tokenModel = new ReplaceToken(options);

      const expectedJson = {
        name: 'FavoriteBand',
        type: 'replace',
        cacheOverride: null,
        skipCache: false,
        value: 'Beatles',
      };
      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('will include an error if instantiated with missing options', (assert) => {
      const tokenModel = new ReplaceToken({});

      assert.equal(tokenModel.errors.length, 1);
      assert.equal(tokenModel.errors[0], 'Missing properties for replace token: "name, value"');
    });

    test('will include an error if value is longer than replace character limit', (assert) => {
      const value = '*'.repeat(101);
      const tokenModel = new ReplaceToken({ name: 'my token', value });

      assert.equal(tokenModel.errors.length, 1);
      assert.equal(tokenModel.errors[0], 'Replace value exceeds 100 character limit');
    });
  });

  module('HmacToken', function () {
    test('can be instantiated with all options', (assert) => {
      const hmacOptions = {
        name: 'hmac_sig',
        cacheOverride: 'xyz',
        skipCache: true,
        options: {
          tokenName: 'hmac_sig',
          stringToSign: 'application/json\nGET\n',
          algorithm: 'sha1',
          secretName: 'watson',
          encoding: 'hex',
        },
      };

      const tokenModel = new HmacToken(hmacOptions);

      const expectedJson = {
        name: 'hmac_sig',
        type: 'hmac',
        cacheOverride: 'xyz',
        skipCache: true,
        options: {
          tokenName: 'hmac_sig',
          stringToSign: 'application/json\nGET\n',
          algorithm: 'sha1',
          secretName: 'watson',
          encoding: 'hex',
        },
      };

      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('gets instantiated with default options', (assert) => {
      const hmacOptions = {
        name: 'hmac_sig',
        options: {
          tokenName: 'hmac_sig',
          stringToSign: 'application/json\nGET\n',
          algorithm: 'sha1',
          secretName: 'watson',
          encoding: 'hex',
        },
      };

      const tokenModel = new HmacToken(hmacOptions);

      const expectedJson = {
        name: 'hmac_sig',
        type: 'hmac',
        cacheOverride: null,
        skipCache: false,
        options: {
          tokenName: 'hmac_sig',
          stringToSign: 'application/json\nGET\n',
          algorithm: 'sha1',
          secretName: 'watson',
          encoding: 'hex',
        },
      };

      assert.deepEqual(tokenModel.toJSON(), expectedJson);
    });

    test('will include an error if instantiated with missing options', (assert) => {
      const hmacOptions = {
        name: 'hmac_sig',
        options: {
          tokenName: 'hmac_sig',
          stringToSign: 'application/json\nGET\n',
          algorithm: 'invalid',
          encoding: 'neo',
        },
      };

      const tokenModel = new HmacToken(hmacOptions);

      const expectedErrors = [
        'HMAC algorithm is invalid',
        'HMAC secret name not provided',
        'HMAC encoding is invalid',
      ];
      assert.deepEqual(tokenModel.errors, expectedErrors);
    });
  });

  module('RequestBuilder', function () {
    test('builds post body payload', (assert) => {
      const options = {
        name: 'FavoriteBand',
        cacheOverride: 'Movable Band',
        value: 'Beatles',
      };

      const replaceToken = new ReplaceToken(options);

      const hmacOptions = {
        name: 'hmac_sig',
        cacheOverride: 'xyz',
        options: {
          stringToSign: 'mystring',
          algorithm: 'sha1',
          secretName: 'watson',
          encoding: 'hex',
        },
      };
      const hmacToken = new HmacToken(hmacOptions);

      const requestBuilder = new RequestBuilder([replaceToken, hmacToken]);

      const expectedPayload = {
        tokenApiVersion: '1',
        tokens: [
          {
            name: 'FavoriteBand',
            cacheOverride: 'Movable Band',
            type: 'replace',
            value: 'Beatles',
            skipCache: false,
          },
          {
            name: 'hmac_sig',
            type: 'hmac',
            cacheOverride: 'xyz',
            skipCache: false,
            options: {
              algorithm: 'sha1',
              encoding: 'hex',
              secretName: 'watson',
              stringToSign: 'mystring',
            },
          },
        ],
      };
      assert.deepEqual(requestBuilder.toJSON(), expectedPayload);
    });

    test('raises an error with invalid tokens', (assert) => {
      const options = {
        cacheOverride: 'Movable Band',
      };

      const replaceToken = new ReplaceToken(options);

      const hmacOptions = {
        cacheOverride: 'xyz',
        options: {
          stringToSign: 'mystring',
          algorithm: 'ash1',
          encoding: 'lex',
        },
      };
      const hmacToken = new HmacToken(hmacOptions);

      const requestBuilder = new RequestBuilder([replaceToken, hmacToken]);
      const expectedErrors = [
        'Errors found while parsing tokens:',
        'token 1: Missing properties for replace token: "name, value".',
        'token 2: Missing properties for hmac token: "name", HMAC algorithm is invalid, HMAC secret name not provided, HMAC encoding is invalid.',
      ];

      assert.throws(function () {
        requestBuilder.toJSON();
      }, new RegExp(expectedErrors.join('\n')));
    });
  });
});

// todo:
// cards
// business logic
// open api spec
// terraform
// setup rollup/build/deploy config
