/**
 * Common web project build tasks for a gulp package
 * @author Andrei Nekrasov <avnk@yandex.ru>
 * @version 1.6.0
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var flatten = require('gulp-flatten');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var rsync  = require('gulp-rsync');
var zip = require('gulp-zip');
var del = require('del');

var less = require('gulp-less');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');

var nodemon = require('gulp-nodemon');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var htmlMin = require('gulp-htmlmin');
var useref = require('gulp-useref');
var env = require('gulp-env');

// TODO: use it nice things
// var cached = require('gulp-cached');
// var remember = require('gulp-remember');

/**
 * Project paths configuration
 */

var path = {
  source: {
    node:   'server/**/*.js',
    yml:    'config/**/*.yml',
    html:   'source/*.html',
    less:   'source/styles/**/*.less',
    img:    'source/images/**/*.+(jpg|jpeg|png|gif|svg)',
    js:     'source/scripts/**/*.js',
    assets: 'source/assets/*',
    json:   './package.json'
  },
  target: {
    assets: 'source/vendor/',
    less:   'source/styles/vendor/',
    css:    'source/build/css/',
    zip:    'temp/'
  },
  build: {
    root:   'dist',
    sync:   'dist/**',
    node:   'dist/server/',
    yml:    'dist/config/',
    html:   'dist/public/',
    js:     'dist/public/js/',
    css:    'dist/public/css/',
    img:    'dist/public/images/',
    fonts:  'dist/public/fonts/',
    assets: 'dist/public',
    zip:    'dist/**/*',
    json:   'dist/'
  },
  watch: {
    html:   'source/*.html',
    less:   'source/styles/**/*.less',
    css:    'source/styles/**/*.css',
    js:     'source/scripts/**/*.js',
    yml:    'config/**/*.yml'
  },
  assets: {
    js: [
      'bower_components/**/*.js',
    ],
    less: [
      'bower_components/**/*.less',
    ],
    css: [
      'bower_components/**/*.css',
    ],
    img: [
      'bower_components/openlayers*/theme/**/*'
    ],
    fonts: [
      'bower_components/*/fonts/*'
    ]
  },
  clean: [
    'dist',
    'source/vendor',
    'source/styles/vendor/',
    'source/fonts',
    'source/build'
  ]
};

/**
 * Modules configuration
 */

var opts = {
  env: 'develop',
  version: '0.0.1',
  autoprefixer: [
    'last 1 version',
    '> 1%'
  ],
  htmlMin: {
    removeComments: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    conservativeCollapse: false
  },
  uglifyJs: {
    compress: {
      global_defs: [],
    }
  },
  /** NOTE: sync with development server settings
  rsync: {
    root: path.build.root,
    destination: '/home/webroot',
    // NOTE: works only on corporate network
    // hostname: 'vc-debian.geocyber.ru',
    hostname: '192.168.100.197',
    username: 'andrey',
    emptyDirectories: true,
    incremental: true,
    progress: true,
    relative: true,
    recursive: true,
    clean: false,
    exclude: ['.DS_Store'],
    include: []
  },
  */
  devServer: {
    startFile:  'server/app.js',
  },
  server: {
    startFile:  'dist/server/app.js',
  }
};

/**
 * Pipelines for assets proccessing
 * TODO: build only modified files
 */

var buildJsPipe = lazypipe()
  .pipe(uglify, opts.uglifyJs) // Pass through only changed files
;

var buildCssPipe = lazypipe()
  .pipe(autoprefixer, opts.autoprefixer)
  .pipe(csso)
;

/**
 * Assets copying pipelines
 */

function copyAssetsJs() {
  return gulp.src(path.assets.js)
    .pipe(gulp.dest(path.target.assets));
}

function copyAssetsCss() {
  return gulp.src(path.assets.css)
    .pipe(gulp.dest(path.target.assets));
}

function copyAssetsLess() {
  return gulp.src(path.assets.less)
    .pipe(gulp.dest(path.target.less));
}

function copyFonts() {
  return gulp.src(path.assets.fonts)
    .pipe(gulp.dest(path.target.assets))
    .pipe(flatten())
      .pipe(gulp.dest(path.build.fonts));
}

/**
 * Main build tasks
 */

function buildLess() {
  return gulp.src(path.source.less)
    .pipe(sourcemaps.init())
      .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.target.css));
}

function buildJs() {
  return gulp.src(path.source.html)
    .pipe(useref())
      .pipe(gulpif('**/*.js', buildJsPipe()))
    .pipe(gulp.dest(path.build.html));
}

function buildHtml() {
  return gulp.src(path.source.html)
    .pipe(useref())
      .pipe(gulpif('**/*.css',  buildCssPipe()))
      .pipe(gulpif('**/*.js',   buildJsPipe()))
      .pipe(gulpif('**/*.html', htmlMin(opts.htmlMin)))
    .pipe(gulp.dest(path.build.html));
}

/**
 * Build for distribution
 */

function copyDistImages() {
  return gulp.src(path.source.img)
    .pipe(gulp.dest(path.build.img));
}

function copyDistAssets() {
  return gulp.src(path.source.assets)
    .pipe(gulp.dest(path.build.assets));
}

function copyDistConfig() {
  return gulp.src(path.source.yml)
    .pipe(gulp.dest(path.build.yml));
}

function copyDistJson() {
  return gulp.src(path.source.json)
    .pipe(gulp.dest(path.build.json));
}

function buildNodeApp() {
  return gulp.src(path.source.node)
    .pipe(buildJsPipe())
    .pipe(gulp.dest(path.build.node));
}

function zipDist() {
  // TODO: versioning
  var fileName = 'dist-0.0.1.zip';
  return gulp.src(path.build.zip)
    .pipe(zip(fileName))
    .pipe(gulp.dest(path.target.zip));
}

/**
 * Serve delelopment server
 */

function setDevEnv(cb) {
  env({ vars: {
    // TODO: why not .env.env.env.env?
    env: gutil.env.env || opts.env
  }});
  cb();
}

function serveDev() {
  nodemon({
    script: opts.devServer.startFile,
    ext: false,
    watch: false
  });
}

/**
 * Serve builded for pruduction server
 */

function setDistEnv(cb) {
  env({ vars: {
    // TODO: why not .env.env.env.env?
    env: gutil.env.env || 'production'
  }});
  cb();
}

function serveDist() {
  nodemon({
    script: opts.server.startFile,
    ext: false,
    watch: false
  });
}

/**
 * Watchers
 */

function watch() {
  gulp.watch(path.watch.less, buildLess);
  gulp.watch(path.watch.html, buildHtml);
  gulp.watch(path.watch.js,   buildJs);
}

/**
 * Define available tasks
 */

gulp.task('clean', function() {
  return del(path.clean);
});

gulp.task('copy', gulp.parallel(
  copyAssetsJs, copyAssetsCss, copyAssetsLess, copyFonts
));

gulp.task('build:less', gulp.series(
  copyAssetsLess, buildLess
));

gulp.task('build:dist', gulp.parallel(
  copyDistConfig, buildNodeApp
));

gulp.task('copy', gulp.parallel(
  copyAssetsJs, copyAssetsCss, copyFonts,
  copyDistImages, copyDistAssets, copyDistJson
));

gulp.task('build', gulp.series(
  'clean', 'copy', 'build:less', gulp.parallel(
    buildHtml, 'build:dist'
  ), zipDist
));

gulp.task('serve', gulp.series(
  setDevEnv, serveDev
));

gulp.task('serve:dist', gulp.series(
  setDistEnv, serveDist
));

gulp.task('deploy', function() {
  return gulp.src(path.build.sync)
    .pipe(rsync(opts.rsync));
});

/**
 * Default task
 */

gulp.task('default', gulp.series(
  'clean', 'build', gulp.parallel(
    watch, 'serve'
  )
));
