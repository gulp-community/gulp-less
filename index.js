var es = require('event-stream');
var less = require('less');
var gutil = require('gulp-util');
var path = require('path');
var defaults = require('lodash.defaults');

module.exports = function (options) {

  function parseLess (file, done) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new Error("gulp-less: Streaming not supported"));

    file.path = gutil.replaceExtension(file.path, '.css');

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
      if (err) return done(err);
      file.contents = new Buffer(tree.toCSS(opts));
      done(null, file);
    });
  }

  return es.map(parseLess);
};


