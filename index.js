'use strict';
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var childProcess = require('child_process');
var through = require('through2');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var pkg = require('lodash-cli/package.json'),
  bin = pkg.bin.lodash,
  builder = require.resolve('lodash-cli/' + bin);

var PLUGIN_NAME = 'gulp-lodash-builder';

function gulpLodashRequire(options) {
  var options = options ? options : {target: './lodash.custom.js', settings: {}, build: 'compat'};
  var dependiencies = [];
  var search = /_\.(\w*)/g;

  var transform = function (file, enc, callback) {
    var that = this;
    if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported... yet...'));
      return callback();
    } else if (file.isStream()) {
      var body = '';
      file.contents.on('data', function (chunk) {
        body += chunk;
      }).on('end', function () {
        var string = String(body)
        var tmp = body.match(search);
        if (tmp) {
          dependiencies = dependiencies.concat(tmp)
        }
        that.push(file);
        callback();
      });
    } else {
      that.push(file);
      callback();
    }
  }

  var flush = function flush(callback) {
    var that = this;
    dependiencies = _.uniq(dependiencies).map(function (item) {
      return item.split('.')[1]
    });
    gutil.log('Building Lodash for:', gutil.colors.green(dependiencies.join(',')));
    childProcess.execFile(builder, [
        '-d',
        '-c',
        options.build,
        'include=' + dependiencies.join(', '),
        'settings=' + JSON.stringify(options.settings)
      ],
      {maxBuffer: 1024 * 600},
      function (error, stdout, stderr) {

        if (error !== null) {
          that.emit('error', new PluginError(PLUGIN_NAME, error));
        }

        mkdirp(path.dirname(options.target), function () {
          fs.writeFile(options.target, stdout, function (error) {
            if (error !== null) {
              that.emit('error', new PluginError(PLUGIN_NAME, error));
            }
            callback();
          });
        })
      });
  }

  return through.obj(transform, flush);
}

module.exports = gulpLodashRequire;