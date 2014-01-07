var es = require('event-stream');
var less = require('less');
var gutil = require('gulp-util');
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {

  function parseLess (file) {
    var self = this;
    if (file.isNull()) return self.emit('data', file); // pass along
    if (file.isStream()) return self.emit('error', new Error("gulp-less: Streaming not supported"));

    // set the default options
    var opts = defaults(options || {}, {
      filename: file.path,
      paths: [ path.dirname(file.path) ]
    });

    // let people use their own compressor
    delete opts.compress;

    var parser = new less.Parser(opts);
    var str = file.contents.toString('utf8');
    parser.parse(str, function (err, tree) {
      if (err) return self.emit('error', err);
      file.contents = new Buffer(tree.toCSS(opts));
      file.path = gutil.replaceExtension(file.path, '.css');
      self.emit('data', file);
    });
  }

  return es.through(parseLess);
};


