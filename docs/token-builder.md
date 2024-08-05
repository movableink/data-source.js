# Token Builder API
## Overview
The Token Builder API provides a means of substituting tokens within an API data source's url, request headers, and post body with dynamic values.

The Token Builder is comprised of two parts: the `RequestBuilder` class and a variety of `Token` classes. Each of the token classes has its own set of validations which are run when the token is instantiated. Any errors are added to an `errors` property on that instance of the token class.

In `sorcerer`, the Token Parser will extract the tokens from the request body and replace any occurrence of the token in an API data source's `url`, `body`, or `headers` with the token's computed value.

## Table of Contents
- [Overview](#overview)
- [Token Classes](#token-classes)
    - [ReplaceToken](#replacetoken)
    - [ReplaceLargeToken](#replacelargetoken)
    - [SecretToken](#secrettoken)
    - [HmacToken](#hmactoken)
    - [RsaToken](#rsatoken)
    - [Sha1Token](#sha1token)
- [RequestBuilder](#requestbuilder)
    - [Generating a request payload](#generating-a-request-payload)
    - [Error handling](#error-handling)
- [Making a request](#making-a-request)
- [Caching](#caching)

## Token Classes

The Token Builder API includes several token utility classes, each serving a unique purpose.

Tokens are instantiated with the following params:
- **name** (required) - the name of the token
- **skipCache** (optional) - if set to `true`, then the token will not be considered when caching requests
- **cacheOverride** (optional) - when provided, this value will be used when caching requests

In addition, each type of token will have its own unique set of properties it should be instantiated with, detailed below.

Currently supported tokens are:

- [ReplaceToken](#replacetoken)
- [ReplaceLargeToken](#replacelargetoken)
- [SecretToken](#secrettoken)
- [HmacToken](#hmactoken)
- [RsaToken](#rsatoken)
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
const replaceValue = "some really long string";

const params = {
  name: 'SongLyrics',
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
Replaces token with an HMAC signature. Used in conjunction with a `secretName` parameter which corresponds to a secret stored on a data source.

HMAC uses symmetric encryption which means the signature requires a shared secret on the Data Source (reference via `secretName`) that the origin API will have a copy of and use to verify.

**Params**
- **options** (required)
  - **stringToSign** (optional) - any string that will be used when generating HMAC signature
  - **algorithm** (required)- the hashing algorithm: `sha1` , `sha256`, `sha512`, `md5`
  - **secretName** (required) - name of the data source secret (e.g. `watson`)
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

### RsaToken
Replaces token with an RSA signature. Used in conjunction with a `secretName` parameter which corresponds to a secret stored on a data source.

RSA uses asymmetric encryption which means the signature requires a RSA keypair. The private key is typically stored on the Data Source (reference via `secretName`) whereas the public key is given to
the origin API's owner to use to verify requests.

**Params**
- **options** (required)
  - **stringToSign** (optional) - any string that will be used when generating an RSA signature
  - **algorithm** (required)- the hashing algorithm: `sha1` , `sha256`, `md5`
  - **secretName** (required) - name of the data source secret (e.g. `watson`)
  - **encoding** (required) - option to encode the signature once it is generated: `hex`, `base64`, `base64url`, `base64percent`
      - `base64url` produces the same result as `base64` but in addition also replaces `+` with `-` , `/` with `_` , and removes the trailing padding character `=`
      - `base64percent` encodes the signature as `base64` and then also URI percent encodes it

**Example:**

```jsx
const params = {
  name: 'rsa_sig',
  options: {
    stringToSign: 'some_message',
    algorithm: 'sha1',
    secretName: 'watson',
    encoding: 'hex',
  },
};

const tokenModel = new RsaToken(params);
```

### Sha1Token

Replaces token with a SHA-1 signature.

**Params**
- **options** (required)
  - **text** (required) - the data that will be hashed to generate the signature
  - **encoding** (required) - option used to encode the result of hash function: `hex`, `base64`
  - **tokens** (optional) - an array of [Secret](#secrettoken) token params that could be included in the `text`. When included, these tokens will be interpolated into the `text`.

**Example:**

If the `text` includes tokens, then then `tokens` array must include secret params corresponding to those tokens.

```jsx
const tokens = [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }];
const params = {
  name: 'sha1_sig',
  options: {
    text: 'the_secret_is_[secureValue]',
    encoding: 'hex',
    tokens,
  },
};

const tokenModel = new Sha1Token(params);
```

If the text does not include a token then the `tokens` array can be left out of the params object when instantiating the Sha1Token.

```
const params = {
  name: 'sha1_sig',
  options: {
    text: 'mystring',
    encoding: 'base64'
  },
};

const tokenModel = new Sha1Token(params);
```

## RequestBuilder

This class is instantiated with an array of tokens and has a `toJSON` method which either returns a payload that can be included in the body of the request to sorcerer *or* throws an error listing validation errors from any invalid tokens.

### Generating a request payload
Calling `toJSON` will return an object with two properties: `tokenApiVersion` and `tokens`.
- `tokenApiVersion` is an internal property that is automatically set. The current namespace version is `V1`.
- `tokens` is an array of POJOS representing the valid tokens.

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

const requestBuilder = new RequestBuilder(tokens);

requestBuilder.toJSON() // returns
// {
//   tokenApiVersion: 'V1',
//   tokens: [
//     {
//       name: 'FavoriteBand',
//       type: 'replace',
//       value: 'Beatles',
//       skipCache: false,
//       cacheOverride: 'Movable Band'
//     },
//     {
//       name: 'myApiKey',
//       type: 'secret',
//       path: 'watson',
//       skipCache: false,
//       cacheOverride: 'xyz'
//     }
//   ]
// };
```

### Error Handling

If any invalid tokens are passed into `RequestBuilder` and `toJSON` is called, an error will be thrown which will state the validation error(s) for each token, separated by the tokens' indexes.

**Example:**

```jsx
"Error: Request was not made due to invalid tokens. See validation errors below:
token 1: Missing properties for replace token: \"name\", Token was not instantiated with a replace value
token 2: ReplaceLarge token can only be used when value exceeds 100 character limit
token 3: Missing properties for secret token: \"path\"
token 4: Missing properties for hmac token: \"name\", HMAC algorithm is invalid, HMAC secret name not provided, HMAC encoding is invalid
token 5: SHA1 encoding is invalid, Invalid secret token passed into SHA1 tokens array"
```

## Making a request
To use the Token Builder API in a custom app, `RequestBuilder` and the relevant token classes can be imported from`data-source.js`

```
import DataSource, {
  RequestBuilder,
  ReplaceToken,
  SecretToken,
  HmacToken
} from '@movable-internal/data-source.js';
```

When setting a property, a `RequestBuilder` can be instantiated with tokens and then used to generate the body for the POST request to Sorcerer using `getRawData`.

```
app.setProperty('apiData', async () => {
  const ds = new DataSource('<DATA SOURCE KEY>');

  const replaceToken = new ReplaceToken({ name: 'breed', value: 'chow' });
  const secretToken = new SecretToken({ name: 'credentials', path: 'api_key' });

  const hmacParams = {
    name: 'hmac_sig',
    options: {
      stringToSign: 'mystring',
      algorithm: 'sha1',
      secretName: 'api_key',
      encoding: 'base64',
    },
  };

  const hmacToken = new HmacToken(hmacParams);

  const tokens = [replaceToken, secretToken, hmacToken];
  const requestBuilder = new RequestBuilder(tokens);
  const postBody = JSON.stringify(requestBuilder.toJSON());

  const options = {
    method: 'POST', // method has to be POST
    body: postBody,
  };

  let { data } = await ds.getRawData({}, options);
  ...
}

```

**Note on error handling**

Even if a valid request is made to Sorcerer using the `RequestBuilder`, Sorcerer has additional validations which will throw an error in the back end. In this situation, calling `getRawData` will return a non-200 `status` code and the value of `data` will be the error message from Sorcerer.

## **Caching**
By default, a `Replace` token's `value` will be used to cache requests. `ReplaceLarge`, `Secret`, `Hmac` and `Sha1` tokens will not be included when caching requests unless `cacheOverride` is supplied.

The `skipCache` and `cacheOverride` properties can be used to customize how the token is handled when caching requests.

**Note**: the value of `cacheOverride` must be less than 100 characters.

**Examples:**

Setting a `cacheOverride` for any token will ignore default behavior and will use the value of `cacheOverride` when caching requests.

```jsx
const replaceValue = "some really long string";

const params = {
  name: 'SongLyrics',
  value: replaceValue,
  cacheOverride: 'name of song'
};

const tokenModel = new ReplaceLargeToken(params);
```

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
