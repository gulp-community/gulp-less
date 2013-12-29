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
var gulp = require('gulp'),
	less = require('gulp-less');

gulp.task('less', function () {
	var lessOptions = {
		compress: true
	};

	gulp.src('less/**/*.less')
		.pipe(less(lessOptions))
		.pipe(gulp.dest('public/css'));
});

gulp.task('default', function () {
	gulp.watch('less/**/*.less', function () {
		gulp.run('less');
	});
});

```

## Options

The options are the same as what's supported by the less parser.

## License

(MIT License)

Copyright (c) 2013 Plus 3 Network dev@plus3network.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
