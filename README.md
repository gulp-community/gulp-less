gulp-less
=========

A LESS plugin for Gulp

[![Build Status](https://travis-ci.org/plus3network/gulp-less.png?branch=master)](https://travis-ci.org/plus3network/gulp-less)

## Install

```
npm install gulp-less
```

## Usage
```javascript
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  gulp.src('./less/**/*.less')
    .pipe(less({
      strictMath: true,
      strictUnits: true
    }))
    .pipe(gulp.dest('./public/css'));
});
```

## Options

The options are the same as what's supported by the less parser:

### Parse options

- `paths` : if not defined is `[path.dirname(file.path)]`
- `optimization`
- `filename` : if not defined is `file.relative`
- `strictImports`
- `syncImport`
- `dumpLineNumbers`
- `relativeUrls`
- `rootpath`
- `modifyVars` : inject less variables


### Render options

- `compress`
- `cleancss`
- `ieCompat`
- `strictMath`
- `strictUnits`
- `sourceMapRootpath`
- `sourceMapBasepath` : if not defined is `file.cwd + '/' + file.base`


## Sourcemaps

Install dependency to `gulp-sourcemaps`

```
npm install --save-dev gulp-sourcemaps
```

```js
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('less', function() {
    gulp.src('src/browser/main.less', { base: 'src/browser/' })
        .pipe(sourcemaps.init())
            .pipe(less({}).on('error', console.error))
        .pipe(sourcemaps.write('maps/' , { sourceRoot: '/src/browser/' }))
        .pipe(gulp.dest('public/dist'));
});
```


## Error handling

By default, a gulp task will fail and all streams will halt when an error happens. To change this behavior check out the error handling documentation [here](https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md)

## License

(MIT License)

Copyright (c) 2014 Plus 3 Network dev@plus3network.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
