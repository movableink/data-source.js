const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babelConf = require('./babel-config');
const pkg = require('./package.json');

module.exports = {
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],

  plugins: [
    babel(babelConf),
    resolve({
      extensions: ['.mjs', '.js', '.ts']
    }),
    commonjs()
  ]
}
