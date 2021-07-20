// Karma configuration
// Generated on Sat Mar 27 2021 18:49:28 GMT+0100 (Midden-Europese standaardtijd)

const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const QUnit = require('qunit');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: __dirname,


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: './tests/core/**/*.js', type: 'module' },
      // { pattern: './tests/event/**/*.js', type: 'module' },
      // { pattern: './tests/responder/**/*.js', type: 'module' },
      // { pattern: './tests/statechart/**/*.js', type: 'module' },
      // { pattern: './tests/testing/**/*.js', type: 'module' },
      // { pattern: './tests/view/**/*.js', type: 'module' },
      // { pattern: './**/*.css', included: true, watched: false }
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'tests/**/*.js': ['webpack']
    },

    // webpack: {
    //   entry: {
    //     qunit: {
    //       import: 'tests/qunit/qunit-2.11.3.js'
    //     }
    //   }
    // },
    webpack: {
      // qunit is provided, I just need to provide module and test
      plugins: [
        new webpack.DefinePlugin({
          module: 'QUnit.module',
          test: 'QUnit.test',
          assert: 'QUnit.assert'
        }),
        new webpack.ProvidePlugin({
          $: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
          jQuery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),    
        })
      ]
    },
    // plugins: ['karma-webpack'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome', 'ChromeHeadless', 'Firefox', 'Safari', 'Opera'],
    // browsers: ['Chrome', 'Firefox'],
    // browsers: ['Chromium', 'Firefox'],
    browsers: ['Chromium'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
