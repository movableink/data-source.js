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

test('x-mi-cbe calculation should not use query params passed via the "x-cache-ignored-query-params" header', async function (assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const keysA = {
    targeting_1: 'hi',
    targeting_2: 'keys',
    ignored_param: 'ignore_me',
  };

  const keysB = {
    targeting_1: 'hi',
    targeting_2: 'keys',
    ignored_param: 'ignore_me_too',
  };

  const keysC = {
    targeting_1: 'hi',
    targeting_2: 'keys',
  };

  const options = {
    headers: { 'x-cache-ignored-query-params': 'ignored_param' },
  };

  await dataSource.getRawData(keysA, options);
  const hashA = CD.get.args[0][1]['headers']['x-mi-cbe'];
  delete CD.get.args[0][1]['headers']['x-mi-cbe'];

  await dataSource.getRawData(keysB, options);
  const hashB = CD.get.args[1][1]['headers']['x-mi-cbe'];
  delete CD.get.args[1][1]['headers']['x-mi-cbe'];

  await dataSource.getRawData(keysC, options);
  const hashC = CD.get.args[2][1]['headers']['x-mi-cbe'];

  assert.equal(hashA, hashB, hashC);

  CD.get.restore();
});

test('x-mi-cbe calculation should be identical if skipCache is set to true', async function (assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const postBodyA = JSON.stringify({
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
        name: 'Song',
        type: 'replace',
        cacheOverride: '',
        value: 'Yellow Submarine',
        skipCache: true,
      },
    ],
  });

  const postBodyB = JSON.stringify({
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
        name: 'Song',
        type: 'replace',
        cacheOverride: '',
        value: 'Hey Jude',
        skipCache: true,
      },
    ],
  });

  const optionsA = { method: 'POST', body: postBodyA };
  const optionsB = { method: 'POST', body: postBodyB };

  await dataSource.getRawData({}, optionsA);
  const hashA = CD.get.args[0][1]['headers']['x-mi-cbe'];
  delete CD.get.args[0][1]['headers']['x-mi-cbe'];

  await dataSource.getRawData({}, optionsB);
  const hashB = CD.get.args[1][1]['headers']['x-mi-cbe'];
  delete CD.get.args[1][1]['headers']['x-mi-cbe'];

  assert.equal(hashA, hashB);

  CD.get.restore();
});

test('multiple instances of a token with identical cache override values should yield an identical x-mi-cbe hash', async function (assert) {
  sinon.stub(CD, 'get');

  const dataSource = new DataSource('some_key');

  const postBodyA = JSON.stringify({
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
        name: 'Song',
        type: 'replace',
        cacheOverride: 'override',
        value: 'Yellow Submarine',
        skipCache: true,
      },
    ],
  });

  const postBodyB = JSON.stringify({
    tokenApiVersion: 'V1',
    tokens: [
      {
        name: 'FavoriteBand',
        type: 'replace',
        cacheOverride: 'Movable Band',
        value: 'Rolling Stones',
        skipCache: false,
      },
      {
        name: 'Song',
        type: 'replace',
        cacheOverride: 'override',
        value: 'Hey Jude',
        skipCache: true,
      },
    ],
  });

  const optionsA = { method: 'POST', body: postBodyA };
  const optionsB = { method: 'POST', body: postBodyB };

  await dataSource.getRawData({}, optionsA);
  const hashA = CD.get.args[0][1]['headers']['x-mi-cbe'];
  delete CD.get.args[0][1]['headers']['x-mi-cbe'];

  await dataSource.getRawData({}, optionsB);
  const hashB = CD.get.args[1][1]['headers']['x-mi-cbe'];
  delete CD.get.args[1][1]['headers']['x-mi-cbe'];

  assert.equal(hashA, hashB);

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
    data: '[{"Level":"1","Tier":"Silver","Content":"Tom and Jerry"},{"Level":"2","Tier":"Gold","Content":"Peter Pan"},{"Level":"1","Tier":"Silver","Content":"Marry Poppins"}]',
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

test('getLocationTargets appends mi to internal query params and returns all geotargeting rows', async function (assert) {
  const response = {
    data: '[{"latitude":"12.34","longitude":"-56.78","name":"Tom and Jerry"},{"latitude":"91.11","longitude":"-12.45","name":"Peter Pan"}]',
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
