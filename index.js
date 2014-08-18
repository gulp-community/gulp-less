var path = require('path');
var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var defaults = require('lodash.defaults');
var convert = require('convert-source-map');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function (options) {
  // Mixes in default options.
  options = defaults(options || {}, {
    compress: false,
    paths: []
  });

  // Internal render method to account for less bug #1921
  // https://github.com/less/less.js/pull/1921
  var render = function(input, options, callback){
    options = options || {};

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    var parser = new less.Parser(options);
    var done = function(e, root){
      if (e) { 
        return callback(e);
      }

      try {
        // The rendered CSS string
        var css = root && root.toCSS && root.toCSS(options);
        callback(null, css);
      } catch (err) { 
        return callback(err);
      }
    };
    parser.parse(input, done, options);
  };

  return through2.obj(function(file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    var str = file.contents.toString('utf8');

    // Clones the options object.
    var opts = defaults({}, options);

    // Injects the path of the current file.
    opts.filename = file.path;

    // Disables source maps
    opts.sourceMap = false;
    // Enables source maps if gulp-sourcemaps has been initted
    if (file.sourceMap) {
      opts.sourceMap = true;
    }

    // Use internal render method that creates a new less.Parser
    render(str, opts, function (err, css) {
      if (err) {

        // Convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        return cb(new PluginError('gulp-less', err));
      } else {
        file.contents = new Buffer(css);
        file.path = gutil.replaceExtension(file.path, '.css');

        if (file.sourceMap) {
          var comment = convert.fromSource(css);
          if (comment) {
            file.contents = new Buffer(convert.removeComments(css));
            var sourceMap = comment.sourcemap;
            for (var i = 0; i < sourceMap.sources.length; i++) {
              sourceMap.sources[i] = path.relative(file.base, sourceMap.sources[i]);
            }
            applySourceMap(file, sourceMap);
          }
        }

        cb(null, file);
      }
    });
  });
};


