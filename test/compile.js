var less = require('../');
var should = require('should');
var lessc = require('less');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');

var expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.css'), 'utf8');
var filePath = path.join(__dirname, 'fixtures', 'test.less');
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
    it('should compile a less file', function (done) {
      var stream = less();
      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);

        newFile.path.should.equal(path.join(__dirname, 'fixtures', 'test.css'));
        newFile.relative.should.equal('test.css');
        String(newFile.contents).should.equal(expected);
        done();
      });
      stream.write(file);
    });
  });
});
