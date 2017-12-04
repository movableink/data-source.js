# Data Source JS

Data Source is a JS library meant to help developers access Movable Ink Data Sources and the raw responses associated with their API integrations.

## Installation

```
npm install data-source
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```js
import DataSource from 'data-source';
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

  client.getRawData(targetingKeys, function(rawData) {
    // do something with the raw data
  });
</script>
```

The `key` above is supposed to be a unique identifier that refers to the data source that you are trying to receive raw
data from. You can find this key in the Movable Ink platform.
