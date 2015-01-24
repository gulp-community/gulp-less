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

    // Bootstrap source maps.

    if (file.sourceMap) {
      opts.sourceMap = {};
    }
   
    less.render(str, opts)
      .then(function(result, opts){
          var css = result.css;
          file.contents = new Buffer(convert.removeComments(css));
          file.path = gutil.replaceExtension(file.path, '.css');
          result.map = JSON.parse(result.map);
          result.map.file = file.relative;
          for (var i = 0; i < result.map.sources.length; i++) {
                   if(typeof result.map.sources[i] !== "undefined") result.map.sources[i] = path.relative(file.base, result.map.sources[i]);
          }
          applySourceMap(file, result.map);
       cb(null, file);   
	   }, function(err){
        // Convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        return cb(new PluginError('gulp-less', err));
      });
  });
};
