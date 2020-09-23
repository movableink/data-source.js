const { module, test } = QUnit;

import DataSource from "../src/index";
import CD from "cropduster";

test(
  "getRawData makes a get request through cropduster with query params",
  function(assert) {
    sinon.stub(CD, "get");

    const dataSource = new DataSource("some_key");

    const keys = {
      targeting_1: "hi",
      targeting_2: "keys"
    };

    dataSource.getRawData(keys, function() {});

    assert.ok(CD.get.calledOnce);

    CD.get.restore();
  }
);

test("getAllRows passes mi_multiple param", async function(assert) {
  const dataSource = new DataSource("some_key");
  const data = { data: "[]" };
  sinon.stub(dataSource, "getRawData").resolves(data);

  const key = { gender: "women" };
  const actualRows = await dataSource.getAllRows(key);

  assert.ok(
    dataSource.getRawData.calledWith({
      gender: "women",
      mi_multiple: true
    })
  );

  dataSource.getRawData.restore();
});

test("getAllRows JSON parses response and returns data", async function(
  assert
) {
  const response = {
    data:
      '[["women","amanda","yellow"],["women","stephanie","blue"],["women","claire","green"]]'
  };
  sinon.stub(CD, "get").resolves(response);

  const dataSource = new DataSource("some_key");
  const key = { gender: "women" };

  const expectedRows = [
    ["women", "amanda", "yellow"],
    ["women", "stephanie", "blue"],
    ["women", "claire", "green"]
  ];
  const actualRows = await dataSource.getAllRows(key);

  assert.propEqual(actualRows, expectedRows);
  CD.get.restore();
});

test("getAllRows supports a headers option", async function(assert) {
  const dataSource = new DataSource("some_key");
  const data = { data: "[]" };
  sinon.stub(dataSource, "getRawData").resolves(data);

  const key = { gender: "women" };
  const actualRows = await dataSource.getAllRows(key, { headers: true });

  assert.ok(
    dataSource.getRawData.calledWith({
      gender: "women",
      mi_multiple: true,
      mi_include_headers: true
    })
  );

  dataSource.getRawData.restore();
});

test(
  'getMultipleTargets JSON parses response and returns data',
  async function (assert) {
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

    const sets = [ { Level: '1', Tier: 'Silver' }, { Level: '2', Tier: 'Gold' } ];
    const actualRows = await dataSource.getMultipleTargets(sets);
    assert.propEqual(actualRows, expectedRows);

    const requestMethod = CD.get.args[0][1]['method'];
    assert.equal(requestMethod, 'POST');

    const postBody = CD.get.args[0][1]['body'];
    assert.equal(postBody, `[{"Level":"1","Tier":"Silver"},{"Level":"2","Tier":"Gold"}]`);

    CD.get.restore();
  }
);

test('getSingleTarget returns all rows for a single targeting set', async function(assert) {
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
        
    const actualRows = await dataSource.getSingleTarget({ Level: '1', Tier: 'Silver' });
    assert.propEqual(actualRows, expectedRows);

    const requestMethod = CD.get.args[0][1]['method'];
    assert.equal(requestMethod, 'POST');

    const postBody = CD.get.args[0][1]['body'];
    assert.equal(postBody, `[{"Level":"1","Tier":"Silver"}]`);

    CD.get.restore();
});

test('getLocationTargets appends mi to internal query params and returns all geotargeting rows', async function(assert) {
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
        
    const actualRows = await dataSource.getLocationTargets({ latitude: '12.66', longitude: '-56.90', storeKey: '123xyz' });
    assert.propEqual(actualRows, expectedRows);

    const sorcererUrl = CD.get.args[0][0];
    assert.ok(sorcererUrl.includes('mi_multiple=true&mi_include_headers=true&mi_lat=12.66&mi_lon=-56.90&storeKey=123xyz'));

    CD.get.restore();
});
