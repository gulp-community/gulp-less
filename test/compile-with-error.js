var less = require('../');
var should = require('should');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');

var filePath = path.join(__dirname, 'fixtures', 'test-with-error.less');
var base = path.join(__dirname, 'fixtures');
var cwd = __dirname;
var file = new gutil.File({
  cwd: cwd,
  base: base,
  path: filePath,
  contents: fs.readFileSync(filePath)
});

describe('gulp-less', function () {
  describe('less()', function () {
    it('should emit error during compile', function (done) {
      var stream = less();
      stream.on('error', function (err) {
        err.should.be.ok;
        done();
      });
      stream.write(file);
    });
  });
});
