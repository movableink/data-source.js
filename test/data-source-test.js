const { module, test } = QUnit;

import DataSource from '../src/index';
import CD from 'cropduster';

QUnit.test('getRawData makes a get request through cropduster with query params', function(assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const keys = {
    targeting_1: "hi",
    targeting_2: "keys"
  };

  dataSource.getRawData(keys, function() {});

  assert.ok(CD.get.calledOnce);

  CD.get.restore();
});

QUnit.test('getRawData invokes the callback passed in', async function(assert) {
  const dataSource = new DataSource('some_key');

  assert.expect(1);
  const callback = function() {
    assert.ok(true);
  }

  const keys = {
    targeting_1: "hi",
    targeting_2: "keys"
  };

  await dataSource.getRawData(keys, callback);
});
