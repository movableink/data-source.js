# Token Builder API

## Overview

The Token Builder is comprised of two parts: the `RequestBuilder` class and a variety of `Token` classes.

Each of the token classes has its own set of validations which are run when the token is instantiated. Any errors are added to an `errors` property on that instance of the token class.

In `sorcerer`, the Token Parser will extract the tokens from the request body and replace any occurrence of the token in an API data source's `url`, `body`, or `headers` with the token's computed value.

## Token Classes

The Token Builder API includes several token utility classes, each serving a unique purpose.

Each token is instantiated with the following params:
- **name** (required) - the name of the token
- **skipCache** (optional) - if set to `true`, then the token will not be considered when caching requests
- **cacheOverride** (optional) - when provided, this value will be used when caching the requests

In addition, each type of token will have its own unique set of properties it should be instantiated with, detailed below.

Currently supported tokens are:

- [ReplaceToken](#replacetoken)
- [ReplaceLargeToken](#replacelargetoken)
- [SecretToken](#secrettoken)
- [HmacToken](#hmactoken)
- [Sha1Token](#sha1token)


### ReplaceToken
Replaces token with the provided value.

**Params**
- **value** (required) - the replace value of the token. The length of this value must be no greater than 100 characters.

**Example:**

```jsx
const params = {
  name: 'FavoriteBand',
  value: 'Beatles',
};

const tokenModel = new ReplaceToken(params);
```

### ReplaceLargeToken
Replaces token with the provided value.

**Params**
- **value** (required)- the replace value of the token. The length of this value must be greater than 100 characters.

**Example:**

```jsx
const replaceValue = "some really long string"

const params = {
  name: 'FavoriteBand',
  value: replaceValue,
};

const tokenModel = new ReplaceLargeToken(params);
```

### SecretToken
Replaces token with the decrypted value of a secret.

**Params**
- **path** (required) - the name of a secret that was created for a data source in the data source wizard.

**Example:**

```jsx
const params = { name: 'myApiKey', path: 'watson' };
const tokenModel = new SecretToken(params);
```

### HmacToken
Replaces token with an HMAC signature.

**Params**
- **options** (required)
  - **stringToSign** (optional) - any string that will be used when generating HMAC signature
  - **algorithm** (required)- the hashing algorithm: `sha1` , `sha256`, `md5`
  - **secretName** (required) - name of the data source secret (ex: `watson`)
  - **encoding** (required) - option to encode the signature once it is generated: `hex`, `base64`, `base64url`, `base64percent`
      - `base64url` produces the same result as `base64` but in addition also replaces `+` with `-` , `/` with `_` , and removes the trailing padding character `=`
      - `base64percent` encodes the signature as `base64` and then also URI percent encodes it

**Example:**

```jsx
const params = {
  name: 'hmac_sig',
  options: {
    stringToSign: 'some_message',
    algorithm: 'sha1',
    secretName: 'watson',
    encoding: 'hex',
  },
};

const tokenModel = new HmacToken(params);
```

### Sha1Token

Replaces token with a SHA-1 signature.

**Params**
- **options** (required)
  - **text** (required) - the data that will be hashed to generate the signature
  - **encoding** (required) - option used to encode the result of hash function: `hex`, `base64`
  - **tokens** (optional) - an array of [Secret](#secrettoken) token params that could be included in the `text`. When included, these tokens will be interpolated into the `text`

**Example:**

```jsx
const tokens = [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }];
const params = {
  name: 'FavoriteBand',
  options: {
    text: 'my text',
    encoding: 'hex',
    tokens,
  },
};

const tokenModel = new Sha1Token(params);
```

## **Caching**
By default, a `Replace` token's `value` will be used to cache requests. `ReplaceLarge`, `Secret`, `Hmac` and `Sha1` tokens will not be included when caching requests unless `cacheOverride` is supplied.

The `skipCache` and `cacheOverride` properties can be used to customize how the token is handled when caching requests:

**Examples:**

Setting `skipCache` to `true` for a token will ensure that the token will not be used to cache requests, even if a `cacheOverride` is set.

```jsx
const params = {
  name: 'FavoriteBand',
  value: 'Beatles',
  cacheOverride: 'My Favorite Band'
  skipCache: true,
};

const tokenModel = new ReplaceToken(params);
```

Setting a `cacheOverride` for any token will ignore default behavior and will use the value of `cacheOverride` when caching requests.

```jsx
const replaceValue = "some really long string"

const params = {
  name: 'SongLyrics',
  value: replaceValue,
  cacheOverride: 'name of song'
};

const tokenModel = new ReplaceLargeToken(params);
```

## RequestBuilder

This class is instantiated with an array of tokens and has a `toJSON` method which either returns a payload that can be included in the body of the request to sorcerer *or* throws an error listing validation errors from any invalid tokens.

### Versioning

The request builder has a `tokenApiVersion` property which will automatically be included in the request payload when calling `toJSON()`. The current namespace version is `V1`.

### Generating a request payload

**Example:**

```jsx
const replaceToken = new ReplaceToken({
  name: 'FavoriteBand',
  cacheOverride: 'Movable Band',
  value: 'Beatles',
});

const secretToken = new SecretToken({
  name: 'myApiKey',
  path: 'watson',
  cacheOverride: 'xyz',
});

const tokens = [
  replaceToken,
  secretToken,
]
const requestBuilder = new RequestBuilder();

requestBuilder.toJSON() // returns
// {
//   tokenApiVersion: 'V1',
//   tokens: [
//     {
//       name: 'FavoriteBand',
//       type: 'replace',
//       cacheOverride: 'Movable Band',
//       value: 'Beatles',
//       skipCache: false,
//     },
//     {
//       name: 'myApiKey',
//       type: 'secret',
//       path: 'watson',
//       skipCache: false,
//       cacheOverride: 'xyz',
//     }
//   ]
// };
```

### Error Handling

If any invalid tokens are passed into `RequestBuilder` and `toJSON()` is called, an error will be thrown which will state the validation error(s) for each token, separated by the tokens' indexes

**Example message:**

```jsx
"Error: Request was not made due to invalid tokens. See validation errors below:
token 1: Missing properties for replace token: \"name\", Token was not instantiated with a replace value
token 2: ReplaceLarge token can only be used when value exceeds 100 character limit
token 3: Missing properties for secret token: \"path\"
token 4: Missing properties for hmac token: \"name\", HMAC algorithm is invalid, HMAC secret name not provided, HMAC encoding is invalid
token 5: SHA1 encoding is invalid, Invalid secret token passed into SHA1 tokens array"
```
