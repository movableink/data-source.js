import {
  TokenBase,
  ReplaceToken,
  ReplaceLargeToken,
  SecretToken,
  HmacToken,
  Sha1Token,
  CHAR_LIMIT,
} from '../../src/token-builder/types';

const { test, module } = QUnit;
module('BaseToken', function () {
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
    const tokenModel = new TokenBase({ name: 'FavoriteBand' });

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'base',
      cacheOverride: null,
      skipCache: false,
    };
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('will include an error if instantiated with missing options', (assert) => {
    const tokenModel = new TokenBase({});
    tokenModel.validateOptions();

    assert.equal(tokenModel.errors.length, 1);
    assert.equal(tokenModel.errors[0], 'Missing properties for base token: "name"');

    const tokenModelWithEmptyName = new TokenBase({ name: '' });
    tokenModelWithEmptyName.validateOptions();

    assert.equal(tokenModelWithEmptyName.errors.length, 1);
    assert.equal(tokenModelWithEmptyName.errors[0], 'Missing properties for base token: "name"');
  });

  test('will include an error if cacheOverride is over the character limit', (assert) => {
    {
      const options = {
        name: 'FavoriteBand',
        type: 'base',
        cacheOverride: '*'.repeat(CHAR_LIMIT),
      };

      const token1 = new TokenBase(options);
      token1.validateOptions();

      assert.equal(token1.errors.length, 0);
    }

    {
      const options = {
        name: 'FavoriteBand',
        type: 'base',
        cacheOverride: '*'.repeat(CHAR_LIMIT + 1),
      };

      const token1 = new TokenBase(options);
      token1.validateOptions();

      assert.equal(token1.errors.length, 1);
      assert.equal(token1.errors[0], `cacheOverride cannot be over ${CHAR_LIMIT} characters`);
    }
  });
});

module('ReplaceToken', function () {
  test('can be instantiated with all options', (assert) => {
    const replaceValue = '*'.repeat(CHAR_LIMIT);

    const options = {
      name: 'FavoriteBand',
      cacheOverride: 'Movable Band',
      value: replaceValue,
      skipCache: true,
    };

    const tokenModel = new ReplaceToken(options);

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'replace',
      cacheOverride: 'Movable Band',
      skipCache: true,
      value: replaceValue,
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

  test('an empty string is a valid replace value', (assert) => {
    const tokenModel = new ReplaceToken({ name: 'MyToken', value: '' });

    assert.equal(tokenModel.errors.length, 0);
  });

  test('will include an error if instantiated with missing options', (assert) => {
    const tokenModel = new ReplaceToken({});

    assert.equal(tokenModel.errors.length, 2);
    assert.equal(tokenModel.errors[0], 'Missing properties for replace token: "name"');
    assert.equal(tokenModel.errors[1], 'Token was not instantiated with a replace value');
  });

  test('will include an error if value is longer than replace character limit', (assert) => {
    const value = '*'.repeat(CHAR_LIMIT + 1);
    const tokenModel = new ReplaceToken({ name: 'my token', value });

    assert.equal(tokenModel.errors.length, 1);
    assert.equal(tokenModel.errors[0], `Replace value exceeds ${CHAR_LIMIT} character limit`);
  });
});

module('ReplaceLargeToken', function () {
  test('can be instantiated with all options', (assert) => {
    const replaceValue = '*'.repeat(CHAR_LIMIT + 1);

    const options = {
      name: 'FavoriteBand',
      cacheOverride: 'Movable Band',
      value: replaceValue,
      skipCache: true,
    };

    const tokenModel = new ReplaceLargeToken(options);

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'replaceLarge',
      cacheOverride: 'Movable Band',
      skipCache: true,
      value: replaceValue,
    };
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('can be instantiated with default options', (assert) => {
    const replaceValue = '*'.repeat(CHAR_LIMIT + 1);
    const options = {
      name: 'FavoriteBand',
      value: replaceValue,
    };

    const tokenModel = new ReplaceLargeToken(options);

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'replaceLarge',
      cacheOverride: null,
      skipCache: false,
      value: replaceValue,
    };
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('will include an error if instantiated with missing options', (assert) => {
    const tokenModel = new ReplaceLargeToken({});

    assert.equal(tokenModel.errors.length, 2);
    assert.equal(tokenModel.errors[0], 'Missing properties for replaceLarge token: "name"');
    assert.equal(tokenModel.errors[1], 'Token was not instantiated with a replace value');
  });

  test('will include an error if value is shorter than replace character limit', (assert) => {
    const tokenModel = new ReplaceLargeToken({ name: 'my token', value: 'Beatles' });

    assert.equal(tokenModel.errors.length, 1);
    assert.equal(
      tokenModel.errors[0],
      `ReplaceLarge token can only be used when value exceeds ${CHAR_LIMIT} character limit`
    );
  });
});

module('SecretToken', function () {
  test('can be instantiated with all options', (assert) => {
    const options = { name: 'myApiKey', path: 'watson', skipCache: true, cacheOverride: 'xyz' };

    const expectedJson = {
      name: 'myApiKey',
      type: 'secret',
      path: 'watson',
      skipCache: true,
      cacheOverride: 'xyz',
    };

    const tokenModel = new SecretToken(options);
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('can be instantiated with default options', (assert) => {
    const options = { name: 'myApiKey', path: 'watson' };

    const expectedJson = {
      name: 'myApiKey',
      type: 'secret',
      path: 'watson',
      skipCache: false,
      cacheOverride: null,
    };

    const tokenModel = new SecretToken(options);
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('will include an error if instantiated with missing options', (assert) => {
    const tokenModel = new SecretToken({});
    assert.deepEqual(tokenModel.errors[0], 'Missing properties for secret token: "name, path"');
  });
});

module('HmacToken', function () {
  test('can be instantiated with all options', (assert) => {
    const hmacOptions = {
      name: 'hmac_sig',
      cacheOverride: 'xyz',
      skipCache: true,
      options: {
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

module('Sha1Token', function () {
  test('can be instantiated with all options', (assert) => {
    const tokens = [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }];
    const sha1Options = {
      name: 'FavoriteBand',
      cacheOverride: 'Movable Band',
      options: {
        text: 'my text',
        encoding: 'hex',
        tokens,
      },
      skipCache: true,
    };

    const tokenModel = new Sha1Token(sha1Options);

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'sha1',
      cacheOverride: 'Movable Band',
      skipCache: true,
      options: {
        text: 'my text',
        encoding: 'hex',
        tokens,
      },
    };
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('can be instantiated with default options', (assert) => {
    const tokens = [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }];
    const sha1Options = {
      name: 'FavoriteBand',
      options: {
        text: 'my text',
        encoding: 'hex',
        tokens,
      },
    };

    const tokenModel = new Sha1Token(sha1Options);

    const expectedJson = {
      name: 'FavoriteBand',
      type: 'sha1',
      cacheOverride: null,
      skipCache: false,
      options: {
        text: 'my text',
        encoding: 'hex',
        tokens,
      },
    };
    assert.deepEqual(tokenModel.toJSON(), expectedJson);
  });

  test('will include an error if instantiated with missing options', (assert) => {
    const tokenModel = new Sha1Token({});

    assert.equal(tokenModel.errors.length, 3);
    assert.equal(tokenModel.errors[0], 'Missing properties for sha1 token: "name"');
    assert.equal(tokenModel.errors[1], 'Missing text to encrypt');
    assert.equal(tokenModel.errors[2], 'SHA1 encoding is invalid');
  });

  test('will include an error if a non-secret-type token is passed into tokens array', (assert) => {
    const tokens = [{ name: 'favorite band', type: 'replaceToken', value: 'beatles' }];
    const tokenModel = new Sha1Token({
      name: 'my_token',
      options: {
        text: 'myfavoriteband',
        encoding: 'base64',
        tokens,
      },
    });

    assert.equal(tokenModel.errors.length, 1);
    assert.equal(tokenModel.errors[0], 'Invalid secret token passed into SHA1 tokens array');
  });

  test('will include an error if a secret token with a missing path is passed into tokens array', (assert) => {
    const tokens = [{ name: 'mysecret', type: 'secret', path: '' }];
    const tokenModel = new Sha1Token({
      name: 'my_token',
      options: {
        text: 'myfavoriteband',
        encoding: 'base64',
        tokens,
      },
    });

    assert.equal(tokenModel.errors.length, 1);
    assert.equal(tokenModel.errors[0], 'Invalid secret token passed into SHA1 tokens array');
  });
});
