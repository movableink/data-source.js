// Karma configuration
// Generated on Tue Nov 21 2017 17:02:58 GMT-0500 (EST)

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],
    plugins: [
      'karma-qunit',
      'karma-chrome-launcher',
      'karma-rollup-preprocessor'
    ],
    // list of files / patterns to load in the browser
    files: [
      { pattern: 'test/*.js', watched: false },
      'src/*.ts'
    ],
    // list of files to exclude
    exclude: [
    ],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.js': ['rollup'],
      'src/**/*.ts': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-typescript')()
      ],
      format: 'iife',
      name: 'DataSource',
      sourcemap: 'inline'
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
