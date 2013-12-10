var es = require('event-stream');
var less = require('less');
var gutil = require('gulp-util');
var path = require('path');
var _ = require('lodash');

module.exports = function (options) {

  function parseLess (file, done) {
    file.path = gutil.replaceExtension(file.path, '.css');

    // set the default options
    var opts = _.defaults(options || {}, {
      compress: false,
      filename: file.path,
      paths: [ path.dirname(file.path) ]
    });

    var parser = new less.Parser(opts);
    parser.parse(file.contents.toString('utf8'), function (err, tree) {
      if (err) return done(err);
      file.contents = new Buffer(tree.toCSS(opts));
      done(null, file);
    });
  }

  return es.map(parseLess);
};


