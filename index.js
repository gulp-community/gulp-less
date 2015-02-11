var path = require('path');
var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var assign = require('object-assign');
var convert = require('convert-source-map');
var applySourceMap = require('vinyl-sourcemaps-apply');

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

    // Clones the options object.
    var opts = assign({}, options);

    // Injects the path of the current file.
    opts.filename = file.path;

    // Bootstrap source maps.
    if (file.sourceMap) {
      opts.sourceMap = {
        sourceMapFileInline: true
      };
    }

    less.render(str, opts)
      .then(function(result, opts){
        file.contents = new Buffer(result.css);
        file.path = gutil.replaceExtension(file.path, '.css');

        if (file.sourceMap) {
          var comment = convert.fromSource(result.css);
          if (comment) {
            file.contents = new Buffer(convert.removeComments(result.css));
            comment.sourcemap.sources = comment.sourcemap.sources.map(function(src){
              return path.relative(file.base, src);
            });
            comment.sourcemap.file = file.relative;
            applySourceMap(file, comment.sourcemap);
          }
        }

        cb(null, file);
    }).catch(function(err){
      // Convert the keys so PluginError can read them
      err.lineNumber = err.line;
      err.fileName = err.filename;

      // Add a better error message
      err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

      throw new PluginError('gulp-less', err);
    }).done(undefined, cb);
  });
};