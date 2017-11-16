# Data Source Client

Data Source Client is a JS library meant to help developers access Movable Ink Data Sources without having to go through a UI.

## Installation

```
npm install data-source-client
```

## Usage

### Setup

The client is meant to be ran in a browser-like environment. The package itself is meant to be imported through ES6 modules.

```js
import DataSourceClient from 'data-source-client';
```

You will need to transpile your project using a module syntax that is supported in the browser, e.g. CommonJS, AMD

### Fetching data

```html
<script>
  const { key, responseMapping } = MI.options;
  const targetingKeys = {
    targeting_1: CD.param('targeting_1'),
    targeting_2: CD.param('targeting_2')
  };

  const client = new DataSourceClient(key, responseMapping);

  client.getData(targetingKeys, function(data) {
    // do something with data
  });
</script>
```

The above example assumes it is running in a context where `MI.options` is injected into the page, similar to most custom apps created in Intelligent Content.

The data pieces required are:

* `key`: The unique identifier of a data source
* `responseMapping`: An array of objects
  * Each mapping object contains the following properties:
    * `key`: The name of the tag which will have its contents replaced by a value
    * `originKey`: A dot separated path that is used to traverse through the raw response to find a value, i.e. `path.to.value`
* `targetingKeys`: (Optional) An object whose properties map to the query param pairs that will be merged into the request. Only required if the data source endpoint query params.

