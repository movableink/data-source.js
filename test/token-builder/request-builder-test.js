import { RequestBuilder } from '../../src/token-builder/request-builder';
import { REPLACE_CHAR_LIMIT } from '../../src/token-builder/types';
import {
  ReplaceToken,
  ReplaceLargeToken,
  SecretToken,
  HmacToken,
  Sha1Token,
} from '../../src/token-builder/types';
const { test, module } = QUnit;

module('RequestBuilder', function () {
  test('builds post body payload', (assert) => {
    const replaceToken = new ReplaceToken({
      name: 'FavoriteBand',
      cacheOverride: 'Movable Band',
      value: 'Beatles',
    });

    const replaceLargeToken = new ReplaceLargeToken({
      name: 'band',
      cacheOverride: 'flooding',
      value: '*'.repeat(REPLACE_CHAR_LIMIT + 1),
      skipCache: true,
    });

    const secretToken = new SecretToken({
      name: 'myApiKey',
      path: 'watson',
      cacheOverride: 'xyz',
    });

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

    const sha1Token = new Sha1Token({
      name: 'sha1_sig',
      options: {
        text: 'my text',
        encoding: 'hex',
        tokens: [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }],
      },
    });

    const requestBuilder = new RequestBuilder([
      replaceToken,
      replaceLargeToken,
      secretToken,
      hmacToken,
      sha1Token,
    ]);

    const expectedPayload = {
      tokenApiVersion: 'V1',
      tokens: [
        {
          name: 'FavoriteBand',
          type: 'replace',
          cacheOverride: 'Movable Band',
          value: 'Beatles',
          skipCache: false,
        },
        {
          name: 'band',
          type: 'replaceLarge',
          cacheOverride: 'flooding',
          value: '*'.repeat(REPLACE_CHAR_LIMIT + 1),
          skipCache: true,
        },
        {
          name: 'myApiKey',
          type: 'secret',
          path: 'watson',
          skipCache: false,
          cacheOverride: 'xyz',
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
        {
          name: 'sha1_sig',
          type: 'sha1',
          cacheOverride: null,
          skipCache: false,
          options: {
            text: 'my text',
            encoding: 'hex',
            tokens: [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }],
          },
        },
      ],
    };
    assert.deepEqual(requestBuilder.toJSON(), expectedPayload);
  });

  test('raises an error with invalid tokens', (assert) => {
    const replaceToken = new ReplaceToken({ cacheOverride: 'Movable Band' });

    const replaceLargeToken = new ReplaceLargeToken({
      name: 'band',
      cacheOverride: 'flooding',
      value: 'short string',
      skipCache: true,
    });

    const secretToken = new SecretToken({
      name: 'myApiKey',
      cacheOverride: 'xyz',
    });

    const hmacOptions = {
      cacheOverride: 'xyz',
      options: {
        stringToSign: 'mystring',
        algorithm: 'ash1',
        encoding: 'lex',
      },
    };
    const hmacToken = new HmacToken(hmacOptions);

    const sha1Token = new Sha1Token({
      name: 'sha1_sig',
      options: {
        text: 'my text',
        encoding: 'flex',
        tokens: [{ name: 'secureValue', type: 'secret', path: '' }],
      },
    });

    const requestBuilder = new RequestBuilder([
      replaceToken,
      replaceLargeToken,
      secretToken,
      hmacToken,
      sha1Token,
    ]);

    const expectedErrors = [
      'Request was not made due to invalid tokens. See validation errors below:',
      'token 1: Missing properties for replace token: "name, value"',
      `token 2: ReplaceLarge token can only be used when value exceeds ${REPLACE_CHAR_LIMIT} character limit`,
      'token 3: Missing properties for secret token: "path"',
      'token 4: Missing properties for hmac token: "name", HMAC algorithm is invalid, HMAC secret name not provided, HMAC encoding is invalid',
      'token 5: SHA1 encoding is invalid, Invalid secret token passed into SHA1 tokens array',
    ];

    assert.throws(function () {
      requestBuilder.toJSON();
    }, new Error(expectedErrors.join('\n')));
  });
});
