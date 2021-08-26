import { TokenBase, ReplaceToken } from '../src/token-builder/v1/token-types';

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
});

// todo:
// hmac token
// request builder test returning array of token objects

// cards
// business logic
// open api spec
// terraform
// setup rollup/build/deploy config
