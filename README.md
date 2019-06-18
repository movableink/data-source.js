# Data Source JS

Data Source is a JS library meant to help developers access Movable Ink Data Sources and the raw responses associated with their API integrations.

## Installation
Add data sources to your package.json file. In `dependencies` include the following:
```
"data-source.js": "https://github.com/movableink/data-source.js.git#v0.1.0"
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```js
import DataSource from "data-source.js"
```

You will need to transpile your project using a module syntax that is supported in the browser, e.g. CommonJS, AMD

### Fetching data

```html
<script>
  const key = "unique_datasource_key";  // pulled from the data sources application
  const targetingKeys = {
    targeting_1: CD.param('targeting_1'),
    targeting_2: CD.param('targeting_2')
  }; // optional params that will get passed to sorcerer

  const client = new DataSource(key);

  client.getRawData(targetingKeys)
        .then(raw => {
          let { data, status contentType, response } = raw;
          //do something with your data
        });
</script>
```

The `key` above is supposed to be a unique identifier that refers to the data source that you are trying to receive raw
data from. You can find this key in the Movable Ink platform.

#### Multiple Rows

To fetch multiple rows you can call `getAllRows(targetingKeys)` which will return an array of rows.
```
const targetingKeys = { category: 'food' };
client.getAllRows(targetingKeys)
        .then(data => {
          //do something with your data
        });
```
Assuming CSV file looks like this (where `category` is the targeting segment, `item1` and `item2` are content fields)
```
category, item1, item2
food, apple, banana
food, cake, rice
food, fish, pasta
toys, car, ball
toys, gun, doll

```
The returned value will be an array of arrays containing entire rows that match specified targeting keys. The csv header names are not included.
```
[["food", "apple", "banana"],["food", "cake", "rice"],["food", "fish", "pasta"]]
```

## Changelog

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
