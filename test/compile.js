var less = require('../');
var should = require('should');
var lessc = require('less');
var fs = require('fs');
var path = require('path');

var expected = fs.readFileSync(path.join(__dirname, 'fixtures', 'test.css'), 'utf8');
var filePath = path.join(__dirname, 'fixtures', 'test.less');
var file = {
  path: filePath,
  shortened: 'test.less',
  contents: fs.readFileSync(filePath)
};

describe('gulp-less', function () {
  describe('less()', function () {
    it('should compile a less file', function (done) {
      var stream = less();
      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);  
        should.exist(newFile.path);
        should.exist(newFile.shortened);
        should.exist(newFile.contents);

        newFile.path.should.equal(path.join(__dirname, 'fixtures', 'test.css'));
        newFile.shortened.should.equal('test.css');
        String(newFile.contents).should.equal(expected);
        done();
      });
      stream.write(file);
    });
  });
});
