# Data Source JS

Data Source is a JS library meant to help developers access Movable Ink Data Sources and the raw responses associated with that Data Source.

## Installation

Add data sources to your package.json file. In `dependencies` include the following:

```
"data-source.js": "https://github.com/movableink/data-source.js.git#v0.3.0"
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```javascript
import DataSource from 'data-source.js';
```

### Fetching data

```javascript
const key = 'unique_datasource_key'; // pulled from the data sources application
const targetingKeys = {
  targeting_1: CD.param('targeting_1'),
  targeting_2: CD.param('targeting_2')
}; // optional params that will get passed to sorcerer

// optional header options to pass to sorcerer
const options = {
  cacheTime: 100000
};

const source = new DataSource(key);

const { data } = await source.getRawData(targetingKeys, options);
//do something with your data
```

The `key` above is supposed to be a unique identifier that refers to the data source that you are trying to receive raw
data from. You can find this key in the Movable Ink platform.

### Multiple Row retrieval for CSV Data Sources

To fetch multiple rows you can call `getAllRows(targetingKeys)` which will return an array of rows.

```javascript
const targetingKeys = { category: 'food' };

// optional header options to pass to sorcerer
const options = {
  cacheTime: 100000
};
const rows = await source.getAllRows(targetingKeys, options);
// [["food", "apple", "banana"], ["food", "cake", "rice"], ["food", "fish", "pasta"]]
```

#### Example

Assuming a CSV file that looks like this (where `category` is the targeting segment, `item1` and `item2` are content fields)

```csv
category, item1, item2
food, apple, banana
food, cake, rice
food, fish, pasta
toys, car, ball
toys, gun, doll
```

The returned value will be an array of arrays containing entire rows that match specified targeting keys. The csv header names are not included.

```json
[
  ["food", "apple", "banana"],
  ["food", "cake", "rice"],
  ["food", "fish", "pasta"]
]
```

### Including Headers

You can include a `headers` option to merge the original headers associated with the CSV as part of the response for `getAllRows`.

#### Example

```javascript
const targetingKeys = { category: 'food' };

// optional header options to pass to sorcerer
const options = {
  headers: true,
  cacheTime: 100000
};
const rows = await source.getAllRows(targetingKeys, options);
// [
//   { category: "food", item1: "apple", item:2 "banana" },
//   { category: "food", item1: "cake", item2: "rice" },
//   { category: "food", item1: "fish", item2: "pasta" }
// ]
```

The response will be an array of objects, where the keys are the headers and the values are the row's values.

### Geolocation

You can also retrieve rows through our GIS capabilities by providing latitude and longitude coordinates while using `getAllRows`.

#### Example

This is assuming a CSV Data Source was created with columns `gap_latitude` and `gap_longitude` specified to be targeted using `latitude` and `longitude` respectively.

```javascript
const targetingKeys = {
  mi_lat: CD.param('mi_lat'),
  mi_lon: CD.param('mi_lon')
};
const rows = await source.getAllRows(targetingKeys);
// assuming `mi_lat` and `mi_lon` were 40, -70 respectively
// [
//   ["The Gap Bryant Park", 40, -70],
//   ["The Gap Time Square", 50, -80],
//   ["The Gap Union Square", 60, -90]
// ]
```

`headers` also works:

```javascript
const targetingKeys = {
  mi_lat: CD.param('mi_lat'),
  mi_lon: CD.param('mi_lon')
};
const rows = await source.getAllRows(targetingKeys, { headers: true });
// assuming `mi_lat` and `mi_lon` were 40, -70 respectively
// {
//   values: [
//     { store_name: "The Gap Bryant Park", gap_latitude: 40, gap_longitude: -70 },
//     { store_name: "The Gap Time Square", gap_latitude: 50, gap_longitude: -80 },
//     { store_name: "The Gap Union Square", gap_latitude: 60, gap_longitude: -90 }
//   ],
//   _meta: {
//     geo_columns: { latitude: 'gap_latitude', longitude: 'gap_longitude' }
//   }
// }
```

Note: including `headers: true`, only for geolocation, will change the response type from the default `Array`, to an object. This is so we can nest `_meta` as part of the returned data so that users can build a dynamic map back to the original columns used for `latitude` and `longitude`.

You will get back by default the three closest locations sorted by distance. We also support the following params:

- `mi_limit`: if not passed, it will default to `3`. You can pass an integer to specify how many locations you would like returned in the payload. The max is `20` and any values sent higher than that will default to `20`
- `mi_radius`: if not passed, it will default to `0`. A radius of 0 will _not_ filter any results down and will act like you did not pass a radius at all. You can pass in any other positive integer for `mi_radius` to further trim the results by distance (unit is miles).

The first argument of `getAllRows` is typically a JS object. Internally that object is converted to URI query parameters and appended to the request on `sorcerer`. You can include any additional query parameters simply by including them into the object:

```
const rows = await source.getAllRows({ mi_lat: latitude, mi_lon: longitude, some_targeting_key: 'key', mi_limit: 5, mi_radius: 2 })
```

#### Priority

When geolocating, if both targeting keys and geolocation columns are set, we will use the following priority to determine which parameters are used to retrieve rows:

- IF both geolocation and targeting columns are set, AND the targeting conditions are fulfilled (read: required targeting keys are supplied)
  - `sorcerer` will _only_ use targeting
- IF both geolocation and targeting columns are set, AND the targeting conditions are not fulfilled
  - `sorcerer` will fall back to geolocation
- IF only geolocation columns are set, AND geolocation conditions are fulfilled (read: `mi_lat` and `mi_lon` are supplied)
  - `sorcerer` will use geolocation
- IF only targeting columns are set, AND targeting conditions are fulfilled
  - `sorcerer` will use targeting

### Multiple target retrieval for CSV Data Sources

To fetch multiple targets from a CSV DataSource you can use the `getMultipleTargets` method, which will return you an array of objects based on the number of rows that match. 

If our CSV file is like below:

Level | Tier | Content
-- | -- | --
1 | Silver | Marry Poppins
2 | Gold | Peter Pan
3 | Platinum | Robin Hood
1 | Silver | Tom and Jerry
5 | Gold | Aladdin
1 | Gold | The Lion King
1 |   | Cinderella

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
const data = await source.getMultipleRows(options);
```

Which returns the following: 

```js
[
  { Level: '1', Tier: 'Silver', Content: 'Tom and Jerry' },
  { Level: '2', Tier: 'Gold', Content: 'Peter Pan' },
  { Level: '1', Tier: 'Silver', Content: 'Marry Poppins' },
]
```

#### Notes on body:

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
    	{"Level": "1", "Tier": "Silver"},
    	{"Level": "3", "Tier": "Platinum"}
    ]
    ```

    is equivalent to

    ```json
    [
      {"Level": "3", "Tier": "Platinum"}
    	{"Level": "1", "Tier": "Silver"}
    ]
    ```

- Every CSV row that matches *ANY* of the targeting sets will be returned

    It's an `OR` between targeting sets and an `AND` for row values inside the set

- CSV rows will always be returned in descending order (last CSV row comes back first)

## Changelog

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
