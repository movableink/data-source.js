import DataSource, { ReplaceToken, HmacToken, RequestBuilder } from '../src/index';
// import CD from 'cropduster';
// import sinon from 'sinon';

const { test } = QUnit;

// ======= tests using RequestBuilder ==============
test('builder', function (assert) {
  const replaceOptions = {
    name: 'mytoken',
    value: 'mytokenvalue',
  };

  const replaceToken = new ReplaceToken(replaceOptions);

  const hmacOptions = {
    name: 'hmac_sig',
    algorithm: 'sha256',
    secretName: 'watson',
    stringToSign: 'mystring',
    encoding: 'base64',
  };

  const hmacToken = new HmacToken(hmacOptions);

  const tokens = [replaceToken, hmacToken];

  const body = new RequestBuilder(tokens).toJSON();

  const expectedTokens = [
    {
      name: 'mytoken',
      value: 'mytokenvalue',
      type: 'replace',
    },
    {
      name: 'hmac_sig',
      options: {
        algorithm: 'sha256',
        encoding: 'base64',
        secretName: 'watson',
        stringToSign: 'mystring',
      },
      type: 'hmac',
    },
  ];
  assert.deepEqual(body, { tokenAPIVersion: '1.1.0', tokens: expectedTokens });
});

test('builder with invalid options', function (assert) {
  const hmacOptions = {
    name: 'hmac_sig',
    algorithm: 'sha256',
    stringToSign: 'mystring',
    encoding: 'base64',
  };

  const hmacToken = new HmacToken(hmacOptions);

  const tokens = [hmacToken];

  let error;

  try {
    new RequestBuilder(tokens).toJSON();
  } catch (e) {
    error = e;
  }

  assert.equal(error?.message, 'Invalid properties for null token:: "secretName" is missing');
});

// ======= tests for Token class + building tokens array in DataSource constructor ==============
test('valid replace class', function (assert) {
  const replaceOptions = {
    name: 'mytoken',
    value: 'mytokenvalue',
  };

  const replaceToken = new ReplaceToken(replaceOptions);
  const dataSource = new DataSource('some_key', [replaceToken]);
  const dsTokens = dataSource.tokens;

  const expectedTokens = [
    {
      name: 'mytoken',
      value: 'mytokenvalue',
      type: 'replace',
    },
  ];

  assert.deepEqual(dsTokens, expectedTokens);
});

test('invalid replace class', function (assert) {
  const replaceOptions = {
    name: 'mytoken',
    value: '',
  };

  const replaceToken = new ReplaceToken(replaceOptions);
  let error;

  try {
    replaceToken.validate();
  } catch (e) {
    error = e;
  }

  assert.equal(error.message, 'Invalid properties for null token:: "value" is missing');
});

test('valid hmac class', function (assert) {
  const hmacOptions = {
    name: 'hmac_sig',
    algorithm: 'sha256',
    secretName: 'watson',
    stringToSign: 'mystring',
    encoding: 'base64',
  };

  const hmacToken = new HmacToken(hmacOptions);

  const dataSource = new DataSource('some_key', [hmacToken]);
  const dsTokens = dataSource.tokens;

  const expectedTokens = [
    {
      name: 'hmac_sig',
      options: {
        algorithm: 'sha256',
        encoding: 'base64',
        secretName: 'watson',
        stringToSign: 'mystring',
      },
      type: 'hmac',
    },
  ];

  assert.deepEqual(dsTokens, expectedTokens);
});

test('invalid hmac class', function (assert) {
  const hmacOptions = {
    name: 'hmac_sig',
    stringToSign: '',
    algorithm: 'sha256',
    encoding: 'base64',
  };

  const hmacToken = new HmacToken(hmacOptions);
  let error;

  try {
    hmacToken.validate();
  } catch (e) {
    error = e;
  }

  assert.equal(
    error.message,
    'Invalid properties for null token:: "secretName, stringToSign" is missing'
  );
});

// test('getRawData makes a get request through cropduster with query params', function (assert) {
//   sinon.stub(CD, 'get');

//   const dataSource = new DataSource('some_key');

//   const keys = {
//     targeting_1: 'hi',
//     targeting_2: 'keys',
//   };

//   dataSource.getRawData(keys, function () {});

//   assert.ok(CD.get.calledOnce);

//   CD.get.restore();
// });

// test('getRawData will stringify object values in targeting params', function (assert) {
//   sinon.stub(CD, 'get');

//   const dataSource = new DataSource('some_key');

//   const keys = {
//     targeting_1: ['foo', 'bar'],
//   };

//   dataSource.getRawData(keys, function () {});

//   assert.ok(CD.get.args[0][0].includes('targeting_1=["foo","bar"]'));

//   CD.get.restore();
// });

// test('getMultipleTargets JSON parses response and returns data', async function (assert) {
//   const response = {
//     data:
//       '[{"Level":"1","Tier":"Silver","Content":"Tom and Jerry"},{"Level":"2","Tier":"Gold","Content":"Peter Pan"},{"Level":"1","Tier":"Silver","Content":"Marry Poppins"}]',
//   };

//   sinon.stub(CD, 'get').resolves(response);

//   const dataSource = new DataSource('some_key');

//   const expectedRows = [
//     { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
//     { Level: '2', Tier: 'Gold', Content: 'Peter Pan' },
//     { Level: '1', Tier: 'Silver', Content: 'Marry Poppins' },
//   ];

//   const sets = [
//     { Level: '1', Tier: 'Silver' },
//     { Level: '2', Tier: 'Gold' },
//   ];
//   const options = {
//     method: 'POST',
//     body: JSON.stringify(sets),
//   };
//   const actualRows = await dataSource.getMultipleTargets(options);
//   assert.propEqual(actualRows, expectedRows);

//   const requestMethod = CD.get.args[0][1]['method'];
//   assert.equal(requestMethod, 'POST');

//   const postBody = CD.get.args[0][1]['body'];
//   assert.equal(postBody, `[{"Level":"1","Tier":"Silver"},{"Level":"2","Tier":"Gold"}]`);

//   CD.get.restore();
// });

// test('getLocationTargets appends mi to internal query params and returns all geotargeting rows', async function (assert) {
//   const response = {
//     data:
//       '[{"latitude":"12.34","longitude":"-56.78","name":"Tom and Jerry"},{"latitude":"91.11","longitude":"-12.45","name":"Peter Pan"}]',
//   };

//   sinon.stub(CD, 'get').resolves(response);

//   const dataSource = new DataSource('some_key');

//   const expectedRows = [
//     { latitude: '12.34', longitude: '-56.78', name: 'Tom and Jerry' },
//     { latitude: '91.11', longitude: '-12.45', name: 'Peter Pan' },
//   ];

//   const actualRows = await dataSource.getLocationTargets({
//     latitude: '12.66',
//     longitude: '-56.90',
//     storeKey: '123xyz',
//   });
//   assert.propEqual(actualRows, expectedRows);

//   const sorcererUrl = CD.get.args[0][0];
//   assert.ok(
//     sorcererUrl.includes(
//       'mi_multiple=true&mi_include_headers=true&mi_lat=12.66&mi_lon=-56.90&storeKey=123xyz'
//     )
//   );

//   CD.get.restore();
// });
