var through = require('through');
var less = require('less');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {

  function parseLess (file) {
    var self = this;
    if (file.isNull()) return this.queue(file); // pass along
    if (file.isStream()) return self.emit('error', new PluginError('gulp-less', 'Streaming not supported'));

    // set the default options
    var opts = defaults(options || {}, {
      filename: file.path,
      paths: [ path.dirname(file.path) ]
    });

    // let people use their own compressor
    delete opts.compress;
    this.pause();

    var parser = new less.Parser(opts);
    var str = file.contents.toString('utf8');
    parser.parse(str, function (err, tree) {
      if (err) return self.emit('error', new PluginError('gulp-less', err));
      file.contents = new Buffer(tree.toCSS(opts));
      file.path = gutil.replaceExtension(file.path, '.css');
      self.queue(file);
      self.resume();
    });
  }

  return through(parseLess);
};


