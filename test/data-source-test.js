const { module, test } = QUnit;

import DataSource from "../src/index";
import CD from "cropduster";

QUnit.test(
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

QUnit.test("getAllRows passes mi_multiple param", async function(assert) {
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

QUnit.test("getAllRows JSON parses response and returns data", async function(
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

QUnit.test("getAllRows supports a headers option", async function(assert) {
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

QUnit.test('getMultipleRows JSON parses response and returns data', async function (
  assert
) {
  const response = {
    data: '[{"Level":"1","Tier":"Silver","Content":"Tom and Jerry"},{"Level":"2","Tier":"Gold","Content":"Peter Pan"},{"Level":"1","Tier":"Silver","Content":"Marry Poppins"}]'
  };

  sinon.stub(CD, 'get').resolves(response);

  const dataSource = new DataSource('some_key');
  const options = {
    method: 'POST',
    body: JSON.stringify([
      {
        Level: 1,
        Tier: 'Silver',
      },
      {
        Level: 2,
        Tier: 'Gold',
      },
    ])
  }
  
  const expectedRows = [
    { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
    { Level: '2', Tier: 'Gold', Content: 'Peter Pan' },
    { Level: '1', Tier: 'Silver', Content: 'Marry Poppins' },
  ];
  const actualRows = await dataSource.getMultipleRows(options);

  assert.propEqual(actualRows, expectedRows);
  CD.get.restore();
});
