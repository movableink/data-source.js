const { module, test } = QUnit;

import DataSource from '../src/index';

QUnit.test('get returns a value based on a dot separated path', function(assert) {
  const dataSource = new DataSource();

  const nestedObject = {
    first: {
      second: {
        third: {
          hi: 'there'
        }
      }
    }
  };

  const value = dataSource.get(nestedObject, 'first.second.third.hi');

  assert.equal(value, 'there');
});
