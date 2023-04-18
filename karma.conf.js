const isDocker = require('is-docker');
const watchMode = process.env.KARMA_WATCH === 'true' || true;

module.exports = function karmaConfig(config) {
  config.set({
    browsers: ['ChromeWithConfiguration'],
    frameworks: ['qunit'],
    files: ['test/**/*.js'],
    crossOriginAttribute: false,
    customLaunchers: {
      ChromeWithConfiguration: {
        base: 'ChromeHeadless',
        flags: isDocker() ? ['--no-sandbox'] : [],
      },
    },
    preprocessors: {
      'test/**/*.js': ['esbuild'],
    },
    esbuild: {
      define: {
        global: 'window',
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
