'use strict'

// @see https://medium.com/notonlycss/how-to-remove-unused-css-ad67421794a7
// @see https://css-tricks.com/gulp-for-beginners/

let gulp = require('gulp')
let sass = require('gulp-sass')
let purgecss = require('gulp-purgecss')
let useref = require('gulp-useref')
let rename = require('gulp-rename')
let browserSync = require('browser-sync').create()
let npmDist = require('gulp-npm-dist')
const fileinclude = require('gulp-file-include')
const image = require('gulp-image')

// styles for pages
gulp.task('deploy-img', function () {
  return gulp.src('src/img/*')
    .pipe(image())
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

// styles for pages
gulp.task('sass-main', function () {
  return gulp.src(['src/scss/*.scss', '!src/scss/_*.*'])
    .pipe(sass().on('error', sass.logError))
    /**
     * Nao pode usar o purge pois o portal usa varios módulos prontos da realejo
     * e portanto precisa ter o bootstrap completo
     .pipe(
     purgecss({
                content: [
                    'src/!**!/!*.html',
                    'dist/vendor/!**!/!*.js',
                    'dist/vendor/!**!/!*.css',
                ]
            })
     )*/
    .pipe(
      purgecss({
        content: [
          'src/*.html',
          'src/**/*.html',
          'dist/vendor/**/*.js',
          'dist/vendor/**/*.css',
          'dist/js/main*.js',
        ]
      })
    )
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('build-html', function () {
  gulp.src(['src/*.html', '!src/_*.*'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(useref())
    .pipe(gulp.dest('./dist'))
})

gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  })
})

gulp.task('serve', ['build-html', 'sass-main', 'browserSync'], function () {
  gulp.watch('src/scss/*.scss', ['sass-main'])
  gulp.watch('src/*.html', ['build-html', 'sass-main'])
  gulp.watch('src/img/*', ['deploy-img'])
  gulp.watch('dist/**', browserSync.reload)
})

// Copy dependencies to lib/
gulp.task('npm-lib', function () {
  gulp.src(npmDist(), { base: './node_modules/' })
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '')
    }))
    .pipe(gulp.dest('lib'))
})
