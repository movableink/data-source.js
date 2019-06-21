# Data Source JS

Data Source is a JS library meant to help developers access Movable Ink Data Sources and the raw responses associated with that Data Source.

## Installation
Add data sources to your package.json file. In `dependencies` include the following:
```
"data-source.js": "https://github.com/movableink/data-source.js.git#v0.2.0"
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```js
import DataSource from "data-source.js"
```

### Fetching data

```js
const key = "unique_datasource_key";  // pulled from the data sources application
const targetingKeys = {
targeting_1: CD.param('targeting_1'),
targeting_2: CD.param('targeting_2')
}; // optional params that will get passed to sorcerer

const source = new DataSource(key);

const { data } = await source.getRawData(targetingKeys);
//do something with your data
```

The `key` above is supposed to be a unique identifier that refers to the data source that you are trying to receive raw
data from. You can find this key in the Movable Ink platform.

### Multiple Row retrieval for CSV Data Sources

To fetch multiple rows you can call `getAllRows(targetingKeys)` which will return an array of rows.

```js
const targetingKeys = { category: 'food' };
const { data } = await source.getAllRows(targetingKeys)
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
[["food", "apple", "banana"], ["food", "cake", "rice"], ["food", "fish", "pasta"]]
```

### Including Headers
You can include a `headers` option to merge the original headers associated with the CSV as part of the response for `getAllRows`.

#### Example

```js
const targetingKeys = { category: 'food' };
const { data } = await source.getAllRows(targetingKeys, { headers: true })
// [
//   { category: "food", item1: "apple", item:2 "banana" },
//   { category: "food", item1: "cake", item2: "rice" },
//   { category: "food", item1: "fish", item2: "pasta" }
// ]
```

The response will be an array of objects, where the keys are the headers and the values are the row's values.

## Changelog

### 0.2.0
  * Add `headers` option support to `getAllRows`
    * Pass `{ headers: true }` as an options argument which will return headers as part of each row's response.

### 0.1.0
  * Add getAllRows function
    * Calling this function returns an array of all rows that match supplied targeting keys

### 0.0.3
  * Remove `src/` as `.npmignore`-ed directory
    * This was originally added to keep the `.ts` files out of the npm package, as people pulling from npm should just use the built `dist/` directory as the entrypoint to the library. Problem is, is that this then keeps `src/` out of the package when users install through the `git` paths. `tsc` fails due to not having any input directories.
    * For now, we can remove this and keep the original `src/` in the package, as most users won't be pulling from `npm`.

### 0.0.2
  * Fix `No inputs were found in config file` by hardcoding `include` path

### 0.0.1
  * Initial release
