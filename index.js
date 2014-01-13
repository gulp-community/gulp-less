var less = require('less');
var through2 = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {

  function transform (file, enc, next) {
    var self = this;

    if (file.isNull()) {
      this.push(file); // pass along
      return next();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-less', 'Streaming not supported'));
      return next();
    }

    var str = file.contents.toString('utf8');

    var opts = defaults(options || {}, {
      filename: file.path,
      paths: [ path.dirname(file.path) ]
    });
    // let people use their own compressor
    delete opts.compress;

    less.render(str, opts, function (err, css) {
      if (err) {
        self.emit('error', new PluginError('gulp-less', err));
      } else {
        file.contents = new Buffer(css);
        file.path = gutil.replaceExtension(file.path, '.css');
        self.push(file);
      }
      next();
    });
  }

  return through2.obj(transform);
};
