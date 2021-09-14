# Token Builder API

## Overview

The Token Builder is comprised of two parts: the `RequestBuilder` class and a variety of `Token` type classes.

Each of the token classes has its own set of validations which are run when the token is instantiated. Any errors are added to an `errors` property on that instance of the token class.

In `sorcerer`, the Token Parser will extract the tokens from the request body and replace any occurrence of the token in an API data source's `url`, `body`, or `headers` with the token's computed value.

## Token Types

The Token Builder API includes several token utility classes, each serving a unique purpose.

Currently supported tokens are:

- [ReplaceToken](#replacetoken)
- [ReplaceLargeToken](#replacelargetoken)
- [SecretToken](#secrettoken)
- [HmacToken](#hmactoken)
- [Sha1Token](#sha1token)

### ReplaceToken

Replaces token with the `value` included in the token options. The length of this value must be no greater than 100 characters.

**Example:**

```jsx
const options = {
  name: 'FavoriteBand',
  cacheOverride: 'Movable Band',
  value: 'Beatles',
  skipCache: true,
};

const tokenModel = new ReplaceToken(options);

tokenModel.toJSON() // returns:
// {
//   name: 'FavoriteBand',
//   type: 'replace',
//   cacheOverride: 'Movable Band',
//   skipCache: true,
//   value: 'Beatles',
// };
```

### ReplaceLargeToken

Functionally, this behaves the same as the `ReplaceToken`, with the difference being that this token should only be used if the length of the replace value is greater than 100 characters.

**Example:**

```jsx
const replaceValue = "some really long string"

const options = {
  name: 'FavoriteBand',
  cacheOverride: 'Movable Band',
  value: replaceValue,
  skipCache: true,
};

const tokenModel = new ReplaceLargeToken(options);

tokenModel.toJSON() // returns:
// {
//   name: 'FavoriteBand',
//   type: 'replaceLarge',
//   cacheOverride: 'Movable Band',
//   skipCache: true,
//   value: 'some really long string',
// };
```

### SecretToken

Replaces token with the decrypted value of the a secret, where `path` is the name of a secret that was created for a data source in the data source wizard.

**Example:**

```jsx
const options = { name: 'myApiKey', path: 'watson', skipCache: true, cacheOverride: 'xyz' };
const tokenModel = new SecretToken(options);

// tokenModel.toJSON() returns:
// {
//   name: 'myApiKey',
//   type: 'secret',
//   path: 'watson',
//   skipCache: true,
//   cacheOverride: 'xyz',
// };

```

### HmacToken

Replaces HMAC token with an HMAC signature generated from the token options.

**Options:**

- **stringToSign**

    String that represents the request & will be used when generating HMAC signature

- **algorithm**

    The hashing algorithm: `sha1` , `sha256`, `md5`

    (for now we only support these 3, but can easily add more later if needed)

- **secretName**

    Name of the data source secret (ex: `watson`)

- **encoding**

    Once the signature is generated it needs to be encoded

    The following encodings are supported: `hex`, `base64`, `base64url`, `base64percent`

    - `base64url` produces the same result as `base64` but in addition also replaces

        `+` with `-` , `/` with `_` , and removes the trailing padding character `=`

    - `base64percent` encodes the signature as `base64` and then also URI percent encodes it

**Example:**

```jsx
const hmacOptions = {
  name: 'hmac_sig',
  cacheOverride: 'xyz',
  skipCache: true,
  options: {
    stringToSign: 'some_message',
    algorithm: 'sha1',
    secretName: 'watson',
    encoding: 'hex',
  },
};

const tokenModel = new HmacToken(hmacOptions);

tokenModel.toJSON() // returns:
// {
//   name: 'hmac_sig',
//   type: 'hmac',
//   cacheOverride: 'xyz',
//   skipCache: true,
//   options: {
//     stringToSign: 'some_message',
//     algorithm: 'sha1',
//     secretName: 'watson',
//     encoding: 'hex',
//   },
// };
```

### Sha1Token

Replaces token with a SHA-1 signature generated from the token options.

**Options:**

- text

    The data that will be hashed to generate the signature

- encoding

    Used to encode the result of hash function.

    Accepted values: `hex` or `base64`

- tokens

    An array of [Secret](#secrettoken) tokens that could be included in the `text`. When included, these tokens will be interpolated into the `text`

**Example:**

```jsx
const tokens = [{ name: 'secureValue', type: 'secret', path: 'mySecretPath' }];
const sha1Options = {
  name: 'FavoriteBand',
  cacheOverride: 'Movable Band',
  options: {
    text: 'my text',
    encoding: 'hex',
    tokens,
  },
  skipCache: true,
};

const tokenModel = new Sha1Token(sha1Options);

tokenModel.toJSON() // returns:
// {
//   name: 'FavoriteBand',
//   type: 'sha1',
//   cacheOverride: 'Movable Band',
//   skipCache: true,
//   options: {
//     text: 'my text',
//     encoding: 'hex',
//     tokens,
//   },
// };
```

## **Caching**

Each token has a couple of properties for handling how the token is included when generating a cache key:

- **skipCache** - if set to `true`, then the token will not be considered when caching requests
- **cacheOverride** - if given a value, this will be used in place of the value of the token when generating the cache key

By default, a `Replace` token's  `value` will be included as part of the cache key. `ReplaceLarge`, `Secret`, `Hmac` and `Sha1` tokens will not be included when generating a cache key unless `cacheOverride` is supplied.

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
