import DataSource from '../src/index';
import CD from 'cropduster';
import sinon from 'sinon';

const { test } = QUnit;

test('getRawData makes a get request through cropduster with query params', function (assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const keys = {
    targeting_1: 'hi',
    targeting_2: 'keys',
  };

  dataSource.getRawData(keys, function () {});

  assert.ok(CD.get.calledOnce);

  CD.get.restore();
});

test('getRawData will stringify object values in targeting params', function (assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const keys = {
    targeting_1: ['foo', 'bar'],
  };

  dataSource.getRawData(keys, function () {});

  assert.ok(CD.get.args[0][0].includes('targeting_1=["foo","bar"]'));

  CD.get.restore();
});

test('getMultipleTargets JSON parses response and returns data', async function (assert) {
  const response = {
    data:
      '[{"Level":"1","Tier":"Silver","Content":"Tom and Jerry"},{"Level":"2","Tier":"Gold","Content":"Peter Pan"},{"Level":"1","Tier":"Silver","Content":"Marry Poppins"}]',
  };

  sinon.stub(CD, 'get').resolves(response);

  const dataSource = new DataSource('some_key');

  const expectedRows = [
    { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
    { Level: '2', Tier: 'Gold', Content: 'Peter Pan' },
    { Level: '1', Tier: 'Silver', Content: 'Marry Poppins' },
  ];

  const sets = [
    { Level: '1', Tier: 'Silver' },
    { Level: '2', Tier: 'Gold' },
  ];
  const options = {
    method: 'POST',
    body: JSON.stringify(sets),
  };
  const actualRows = await dataSource.getMultipleTargets(options);
  assert.propEqual(actualRows, expectedRows);

  const requestMethod = CD.get.args[0][1]['method'];
  assert.equal(requestMethod, 'POST');

  const postBody = CD.get.args[0][1]['body'];
  assert.equal(postBody, `[{"Level":"1","Tier":"Silver"},{"Level":"2","Tier":"Gold"}]`);

  CD.get.restore();
});

test('getSingleTarget returns all rows for a single targeting set', async function (assert) {
  const response = {
    data:
      '[{"Level":"1","Tier":"Silver","Content":"Tom and Jerry"},{"Level":"1","Tier":"Silver","Content":"Peter Pan"}]',
  };

  sinon.stub(CD, 'get').resolves(response);

  const dataSource = new DataSource('some_key');

  const expectedRows = [
    { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
    { Level: '1', Tier: 'Silver', Content: 'Peter Pan' },
  ];

  const targetingSet = [{ Level: '1', Tier: 'Silver' }];
  const options = {
    method: 'POST',
    body: JSON.stringify(targetingSet),
  };
  const actualRows = await dataSource.getSingleTarget(options);
  assert.propEqual(actualRows, expectedRows);

  const requestMethod = CD.get.args[0][1]['method'];
  assert.equal(requestMethod, 'POST');

  const postBody = CD.get.args[0][1]['body'];
  assert.equal(postBody, `[{"Level":"1","Tier":"Silver"}]`);

  CD.get.restore();
});

test('getLocationTargets appends mi to internal query params and returns all geotargeting rows', async function (assert) {
  const response = {
    data:
      '[{"latitude":"12.34","longitude":"-56.78","name":"Tom and Jerry"},{"latitude":"91.11","longitude":"-12.45","name":"Peter Pan"}]',
  };

  sinon.stub(CD, 'get').resolves(response);

  const dataSource = new DataSource('some_key');

  const expectedRows = [
    { latitude: '12.34', longitude: '-56.78', name: 'Tom and Jerry' },
    { latitude: '91.11', longitude: '-12.45', name: 'Peter Pan' },
  ];

  const actualRows = await dataSource.getLocationTargets({
    latitude: '12.66',
    longitude: '-56.90',
    storeKey: '123xyz',
  });
  assert.propEqual(actualRows, expectedRows);

  const sorcererUrl = CD.get.args[0][0];
  assert.ok(
    sorcererUrl.includes(
      'mi_multiple=true&mi_include_headers=true&mi_lat=12.66&mi_lon=-56.90&storeKey=123xyz'
    )
  );

  CD.get.restore();
});
