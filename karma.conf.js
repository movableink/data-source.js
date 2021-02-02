const isDocker = require('is-docker');
const watchMode = process.env.KARMA_WATCH === 'true' || true;
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babelConf = require('./babel-config');

module.exports = function karmaConfig(config) {
  config.set({
    browsers: ['ChromeWithConfiguration'],
    frameworks: ['qunit'],
    files: ['test/*.js'],
    crossOriginAttribute: false,
    customLaunchers: {
      ChromeWithConfiguration: {
        base: 'ChromeHeadless',
        flags: isDocker() ? ['--no-sandbox'] : [],
      },
    },
    preprocessors: {
      'test/*.js': ['rollup'],
    },
    rollupPreprocessor: {
      input: 'test/data-source-test.js',
      context: 'window',
      plugins: [
        babel(babelConf),
        resolve({
          extensions: ['.mjs', '.js', '.ts'],
        }),
        commonjs(),
      ],
      output: {
        format: 'iife',
        name: 'dataSourceJSTests',
        sourcemap: 'inline',
      },
    },
    autoWatch: watchMode,
    singleRun: !watchMode,
    client: {
      clearContext: false,
      captureConsole: false,
      qunit: {
        showUI: true,
        testTimeout: 60000,
      },
    },
  });
};
