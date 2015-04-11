var less           = require('less');
var path           = require('path');
var through2       = require('through2');
var gutil          = require('gulp-util');
var assign         = require('object-assign');
var applySourceMap = require('vinyl-sourcemaps-apply');

var PluginError    = gutil.PluginError;

module.exports = function (options) {
  // Mixes in default options.
  options = assign({}, {
      compress: false,
      paths: []
    }, options);

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    var str = file.contents.toString();

    // Clones the options object
    var opts = assign({}, options);

    // Injects the path of the current file
    opts.filename = file.path;

    // Bootstrap source maps, but only if not configured by the user
    if (file.sourceMap && !opts.sourceMap) {
      opts.sourceMap = {
        sourceMapBasepath: path.resolve(file.base)
      };
    }

    less.render(str, opts, function (error, output) {
      if (error) {
        error.lineNumber = error.line;
        error.fileName = error.filename;

        // Add a better error message
        error.message = error.message + ' in file ' + error.fileName + ' line no. ' + error.lineNumber;

        cb(new PluginError('gulp-less', error));
      } else {
        file.contents = new Buffer(output.css);
        file.path = gutil.replaceExtension(file.path, '.css');
        if (output.map) {
          var map = JSON.parse(output.map);
          map.file = file.relative;
          applySourceMap(file, map);
        }
        cb(null, file);
      }
    });
  });
};
