const { build } = require('esbuild');
const { dependencies } = require('./package.json');

const entryFile = 'src/index.ts';
const shared = {
  bundle: true,
  entryPoints: [entryFile],
  // Treat all dependencies in package.json as externals to keep bundle size to a minimum
  external: Object.keys(dependencies),
  logLevel: 'info',
  minify: false,
  sourcemap: true,
};

build({
  ...shared,
  format: 'esm',
  outfile: './dist/index.es.js',
  target: ['esnext'],
});

build({
  ...shared,
  format: 'cjs',
  outfile: './dist/index.js',
  target: ['esnext'],
});
