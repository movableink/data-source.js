const { module, test } = QUnit;

import DataSource from '../src/index';
import CD from 'cropduster';
import watch from './helpers/spy';

QUnit.test('getRawData makes a get request through cropduster with query params', async function(assert) {
  const spy = watch(CD, 'get');

  const dataSource = new DataSource('some_key');

  assert.expect(1);

  const keys = {
    targeting_1: "hi",
    targeting_2: "keys"
  };

  await dataSource.getRawData(keys, function(_) {
    assert.ok(spy.called(1));
    spy.restore();
  });
});
