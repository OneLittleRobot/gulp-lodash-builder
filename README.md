# gulp-lodash-builder  
> A tool to create a customised version of lodash 

## Usage

Install `gulp-lodash-builder` as a development dependency:

```shell
$ npm install --save-dev gulp-lodash-builder
```

Then, add it to your `gulpfile.js`:

### Gulp Example
```javascript
var gulp = require('gulp');
var lodashBuilder = require('gulp-lodash-builder');

var options = {
  target: "/assets/javascript/vendor/lodash.custom.js",
  settings: {}
};
gulp.task('lodash', function (cb) {
  return gulp.src("/assets/javascript/src/**", {buffer: false})
    .pipe(lodashBuilder(options))
    .on('error', function (err) {
      console.log('err: ', err)
    })
});
```
