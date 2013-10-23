var es = require('event-stream');
var clone = require('clone');
var less = require('less');
var util = require('gulp-util');
var path = require('path');
var _ = require('lodash');

module.exports = function (options) {

  function parseLess (file, done) {
    var newFile = clone(file);
    newFile.path = util.replaceExtension(newFile.path, '.css');
    newFile.shortened = util.replaceExtension(newFile.shortened, '.css');
  
    // set the default options
    var opts = _.defaults(options || {}, {
      compress: false,
      filename: file.path,
      paths: [ path.dirname(newFile.path) ]
    });

    var parser = new less.Parser(opts);
    parser.parse(newFile.contents.toString('utf8'), function (err, tree) {
      if (err) return done(err);
      newFile.contents = new Buffer(tree.toCSS(opts));
      done(null, newFile);
    });
  }

  return es.map(parseLess);
};


