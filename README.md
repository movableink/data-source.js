# Data Source JS

Data Source is a JS library meant to help developers access Movable Ink Data Sources and the raw responses associated with that Data Source.

## Table Of Contents

- [Data Source JS](#data-source-js)
  - [Table Of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Setup](#setup)
    - [Fetching data for API and Website Data Sources](#fetching-data-for-api-and-website-data-sources)
      - [Example:](#example)
    - [Multiple target retrieval for CSV Data Sources](#multiple-target-retrieval-for-csv-data-sources)
      - [Example](#example-1)
      - [Notes on multiple targets body:](#notes-on-multiple-targets-body)
    - [Get rows based on geo-location](#get-rows-based-on-geo-location)
      - [Example](#example-2)
      - [Details on how Sorcerer determines priority](#details-on-how-sorcerer-determines-priority)
  - [Publishing package:](#publishing-package)
  - [Changelog](#changelog)
    - [4.1.0](#410)
    - [3.2.3](#323)
    - [3.2.2](#322)
    - [3.2.1](#321)
    - [3.2.0](#320)
    - [3.1.0](#310)
    - [3.0.0](#300)
    - [2.0.0](#200)
    - [1.0.0](#100)
    - [0.3.0](#030)
    - [0.2.2](#022)
    - [0.2.1](#021)
    - [0.2.0](#020)
    - [0.1.0](#010)
    - [0.0.3](#003)
    - [0.0.2](#002)
    - [0.0.1](#001)

## Installation

There are two ways to install the package to your project.
You can run the following command in your terminal

```
yarn add @movable-internal/data-source.js
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```javascript
import DataSource from '@movable-internal/data-source.js';
```

### Fetching data for API and Website Data Sources

```javascript
const key = 'unique_datasource_key'; // pulled from the data sources application
const targetingKeys = {
  targeting_1: CD.param('targeting_1'),
  targeting_2: CD.param('targeting_2'),
}; // optional params that will get passed to sorcerer

// optional header options to pass to sorcerer
const options = {
  cacheTime: 100000,
};

const source = new DataSource(key);

const { data } = await source.getRawData(targetingKeys, options);
//do something with your data
```

The `key` above is supposed to be a unique identifier that refers to the data source that you are trying to receive raw
data from. You can find this key in the Movable Ink platform.

#### Example

If the API DS is set up with the following URL

`https://product-api.com/product/[productID]/[variationID]`

Then we would do something like so

```
const dsKey = 'DATA_SOURCE_KEY'
const targetingKeys = {
  productID = 123,
  variationID = abc
};

const source = new DataSource(dsKey);
const { data } = await source.getRawData(targetingKeys);
```

Which will replace the tokens in the call and effectively the call will be

`https://product-api.com/product/123/abc`


### Passing in tokens to the request body
The `RequestBuilder` and `Token` utility classes allow users of `data-source.js` to easily pass in tokens to the body of the POST request when calling `getRawData` for an API data source.

These tokens can be included in the `options` object as an alternative to passing them in as `targetingKeys`. The computed values of each token will replace that token when included in the data source's url, post body, or headers.

[See separate docs for examples and additional details on the Token Builder API](./docs/token-builder.md).

### Multiple target retrieval for CSV Data Sources

To fetch multiple targets from a CSV DataSource you can use the `getMultipleTargets` method, which will return you an array of objects based on the number of rows that match.

#### Example

If our CSV file is like below:

| Level | Tier     | Content       |
| ----- | -------- | ------------- |
| 1     | Silver   | Marry Poppins |
| 2     | Gold     | Peter Pan     |
| 3     | Platinum | Robin Hood    |
| 1     | Silver   | Tom and Jerry |
| 5     | Gold     | Aladdin       |
| 1     | Gold     | The Lion King |
| 1     |          | Cinderella    |

You can make a request like this:

```js
const options = {
  method: 'POST', // method has to be POST
  body: JSON.stringify([
    {
      Level: 1,
      Tier: 'Silver',
    },
    {
      Level: 2,
      Tier: 'Gold',
    },
  ]),
};

const source = new DataSource('some_key');
const data = await source.getMultipleTargets(options);
```

Which returns the following:

```js
[
  { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
  { Level: '2', Tier: 'Gold', Content: 'Peter Pan' },
  { Level: '1', Tier: 'Silver', Content: 'Marry Poppins' },
];
```

#### Notes on multiple targets body:

- you can pass up to 200 targeting sets in the array, everything after will be ignored
- each set must include the value for each targeting column

  if `Level` and `Tier` are targeting columns then the set needs to have both `Level` and `Tier` inside the set

  like this:

  `{ "Level": "value 1", "Tier": "value2"}`

  If any targets are missing inside of the set then that key will have a empty string by default.

- order within each targeting set doesn't matter

  `{"Level": "1", "Tier": "Silver"}`

  is equivalent to

  `{"Tier": "Silver", "Level": "1"}`

- order between all targeting sets doesn't matter

  ```json
  [
    { "Level": "1", "Tier": "Silver" },
    { "Level": "3", "Tier": "Platinum" }
  ]
  ```

  is equivalent to

  ```json
  [
    { "Level": "3", "Tier": "Platinum" },
    { "Level": "1", "Tier": "Silver" }
  ]
  ```

- Every CSV row that matches _ANY_ of the targeting sets will be returned

  It's an `OR` between targeting sets and an `AND` for row values inside the set

- CSV rows will always be returned in descending order (last CSV row comes back first)

---

### Get rows based on geo-location

Using this method you can retrieve rows through our GIS capabilities by providing latitude and longitude coordinates while using `getLocationTargets`.

**_Input:_**

**params (object with query params)**

- latitude & longitude --- will be used if targeting params are not provided
- includeHeaders --- passed by default
- multiple --- passed by default
- radius --- if not passed, it will default to `0`. A radius of 0 will _not_ filter any results down and will act like you did not pass a radius at all. You can pass in any other positive integer for `radius` to further trim the results by distance (unit is miles).
- limit --- if not passed, it will default to `3`. You can pass an integer to specify how many locations you would like returned in the payload. The max is `20` and any values sent higher than that will default to `20`
- You can inlcude targeting params within the params object

**options** (this is optional in case you want to override existing headers or add new ones i.e `cacheTime`)

**_Return value:_**

object with `values` and `_meta` properties.
(_You will get back by default the three closest locations sorted by distance._)

#### Example

```js
const params = {
  latitude: '34.80319',
  longitude: '-92.25379',
  radius: 20,
};

const source = new DataSource('some_key');
const data = await source.getLocationTargets(params);
/*returned data now contains something like this
{
    "values": [
        {
            "latitude": "34.80319",
            "longitude": "-92.25379",
            "key": "3",
            "name": "New York",
        },
        {
            "latitude": "34.782548",
            "longitude": "-92.217848",
            "key": "7",
            "name": "London",
        },
        {
            "latitude": "34.832243",
            "longitude": "-92.195878",
            "key": "6",
            "name": "Paris",
        }
    ],
    "_meta": {
        "geo_columns": {
            "latitude": "latitude",
            "longitude": "longitude"
        }
    }
}
*/
```

You can pass targeting param(s) and get back a specific row.
Assuming `key` is the targeting column in our geolocated CSV.

```js
//since we're passing a targeting param [key: '3'], latitude and longitude will be ignored
const params = { latitude: '34.80319', longitude: '-92.25379', key: '3' };
const source = new DataSource('some_key');
const data = await source.getLocationTargets(params);
/*returned data now contains a single row matching the targeting param
{
    "values": [
        {
            "latitude": "34.80319",
            "longitude": "-92.25379",
            "key": "3",
            "name": "New York",
        }
    ],
    "_meta": {
        "geo_columns": {
            "latitude": "latitude",
            "longitude": "longitude"
        }
    }
}
*/
```

#### Details on how Sorcerer determines priority

When geolocating, if both targeting keys and geolocation columns are set, we will use the following priority to determine which parameters are used to retrieve rows:

- IF both geolocation and targeting columns are set, AND the targeting conditions are fulfilled (read: required targeting keys are supplied)
  - `sorcerer` will _only_ use targeting
- IF both geolocation and targeting columns are set, AND the targeting conditions are not fulfilled
  - `sorcerer` will fall back to geolocation
- IF only geolocation columns are set, AND geolocation conditions are fulfilled (read: `latitude` and `longitude` are supplied)
  - `sorcerer` will use geolocation
- IF only targeting columns are set, AND targeting conditions are fulfilled
  - `sorcerer` will use targeting

---

## Publishing package:

If this is your first time publishing to Package Cloud, you may need to configure your npm to use it. Run:

```
$ npm login --scope=@movable-internal --registry=https://packagecloud.io/movableink/studio/npm/
```

To install dependecies and build dist directory, cd into data-source.js and run:

```
$ yarn install
```

Then to publish the package to packagecloud run:

```
$ npm publish
```

---

## Changelog

### 4.1.0

- allows to pass sha512 algorithm for HMAC token

### 3.2.3

- Fixes `x-mi-cbe` header hash calculation to use correct `x-cache-ignore-query-params` header

### 3.2.2

- Updates `x-mi-cbe` header hash calculation to ignore params/tokens passed through `x-cache-ignored-query-params` and `skipCache: true` respectively

### 3.2.1

- Runs `yarn upgrade --recursive` to fix CVE vulnerability in sub-dependency and general updates for all sub-dependencies

### 3.2.0

- Adds RSA Signature support via `RsaToken` token utility class

### 3.1.0

- Creates `RequestBuilder` and "Token" type utility classes

### 3.0.0

- Remove `getSingleTarget` method

### 2.0.0

- Stringifies objects before placing them into param string when using `getRawData`
  - The old behavior:
    ```
      "key" + ["foo", "bar"]
      "keyfoo,bar"
    ```
  - The above would produce an unexpected query param string which was not intentional
- BREAKING: This adds enough dependency updates that we would feel more comfortable making this a major version change.

### 1.0.0

- Remove `getAllRows()` method
- Refactor existing methods
- Make this package avalable on packagecloud
- Replace built-in ts compiler with ts compiler in babel

### 0.3.0

- Add support for `POST` request to `sorcerer` which allows for targeting multiple segments in DataSource with the method `getMultipleTargets`
- Update `CropDuster` to be `7.1.0`

### 0.2.2

- Update TypeScript from `2.6.1` to `3.7.4`

### 0.2.1

- Add additional `headers` support to `getRawData` & `getAllRows`
  - Pass additional params such as `{ headers: true, cacheTime: 100000 }` as the 2nd argument which will increase the cache time

### 0.2.0

- Add `headers` option support to `getAllRows`
  - Pass `{ headers: true }` as an options argument which will return headers as part of each row's response.

### 0.1.0

- Add getAllRows function
  - Calling this function returns an array of all rows that match supplied targeting keys

### 0.0.3

- Remove `src/` as `.npmignore`-ed directory
  - This was originally added to keep the `.ts` files out of the npm package, as people pulling from npm should just use the built `dist/` directory as the entrypoint to the library. Problem is, is that this then keeps `src/` out of the package when users install through the `git` paths. `tsc` fails due to not having any input directories.
  - For now, we can remove this and keep the original `src/` in the package, as most users won't be pulling from `npm`.

### 0.0.2

- Fix `No inputs were found in config file` by hardcoding `include` path

### 0.0.1

- Initial release
