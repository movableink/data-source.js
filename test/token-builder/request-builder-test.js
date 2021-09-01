import { RequestBuilder } from '../../src/token-builder/request-builder';
import { ReplaceToken, HmacToken } from '../../src/token-builder/types';
const { test, module } = QUnit;

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
      tokenApiVersion: 'V1',
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
