/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                         *
 * gridmovies | Grid Movies built with HTML and CSS                        *
 * http://gridmovies.cool                                                  *
 * Copyright 2016 © Yair Rodriguez                                         *
 * Licensed under MIT (https://github.com/yairodriguez/gridmovies)         *
 *                                                                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/*eslint-disable no-multi-spaces*/
import gulp         from 'gulp';
import plugins      from 'gulp-load-plugins';
import browsersync  from 'browser-sync';
import remove       from 'del';

const $             = plugins();
const reload        = browsersync.reload;
/*eslint-enable no-multi-spaces*/

/**
 * @name clean
 * @kind task
 *
 * @description
 * Using `del` npm package, this task delete `.tmp` and `dist` folders.
 *
 * @plugins
 *    - gulp
 *    - del
 */
// gulp.task('clean', remove.bind(null, ['.tmp', 'dist']));
gulp.task('clean', () => {
  return remove.sync(['.tmp', 'dist']);
});

/**
 * @name pug
 * @kind task
 *
 * @description
 * Compiles `pug` templates into `html` files. Using `gulp-pug` plugin to generate
 * pretty html and save it into `.tmp` folder. Also report to `browser-sync` that
 * task need to reload.
 *
 * @plugins
 *    - gulp
 *    - gulp-pug
 *    - browser-sync
 *
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 */

gulp.task('pug', () => {
  return gulp
    .src('app/templates/*.pug')
    .pipe($.plumber({
      errorHandler: $.notify.onError({
        title: 'JADE',
        subtitle: 'Compile',
        message: 'Error compiling your .pug files'
      })
    }))
    .pipe($.pug({ pretty: true }))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({ stream: true }))
    .on('error', $.notify.onError({
      title: 'JADE',
      subtitle: 'Compile',
      message: 'Error compiling your .pug files'
    }))
    .pipe($.notify({
      title: 'JADE',
      subtitle: 'Compile',
      message: 'Your .pug templates were generated'
    }));
});

/**
 * @name sass
 * @kind task
 *
 * @description
 * Compiles `.scss` files into `css` code. Uses `plumber` plugin to keep running
 * if an error exists, write `sourcemaps` and generate `css` code with expanded
 * style. On error notify with `gulp-sass` error function and `autoprefixer` to
 * write all neccessary vendor prefixes. At the end, rename the file and save it
 * into `.tmp/styles`  folder.
 *
 * @plugins
 *    - gulp
 *    - gulp-plumber
 *    - gulp-sourcemaps
 *    - gulp-sass
 *    - gulp-autoprefixer
 *    - gulp-rename
 *    - browser-sync
 *
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 */
gulp.task('sass', () => {
  return gulp
    .src('app/styles/*.scss')
    .pipe($.plumber({
      errorHandler: $.notify.onError({
        title: 'SCSS',
        subtitle: 'Compile',
        message: 'Error compiling your .scss files'
      })
    }))
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 5 versions', 'Firefox ESR']
    }))
    .pipe($.sourcemaps.write())
    .pipe($.rename('gridmovies.css'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({ stream: true }))
    .pipe($.notify({
      title: 'SCSS',
      subtitle: 'Compile',
      message: 'Your .scss file was generated'
    }));
});

/**
 * @name html
 * @kind task
 *
 * @description
 * Minify `html`, `css`, `scripts` files using `gulp-useref` plugin function from
 * `.tmp` files, and save it into `dist` folder.
 *
 * @plugins
 *    - gulp
 *    - gulp-useref
 *    - gulp-uglify
 *    - gulp-clean-css
 *    - gulp-htmlmin
 *
 * @dependencies {task} pug, sass, scripts
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 */
gulp.task('html', ['pug', 'sass'], () => {
  return gulp
    .src('.tmp/**/*.*')
    .pipe($.useref({ searchPath: '.tmp' }))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest('dist'));
});

/**
 * @name images
 * @kind kind
 *
 * @description
 * Optimize all images from `app/images` folder using `gulp-cache` and
 * `gulp-imagemin` plugins. And save it into `dist/images` folder.
 *
 * @plugins
 *    - gulp
 *    - gulp-cache
 *    - gulp-imagemin
 *
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 */
gulp.task('images', () => {
  return gulp
    .src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{ cleanupIDs: false }]
    })))
    .pipe(gulp.dest('dist/images'));
});

/**
 * @name extras
 * @kind task
 *
 * @description
 * Copy all extra files from `app` folder to `dist` folder.
 *
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 *
 */
gulp.task('extras', () => {
  return gulp
    .src([
      'app/*.*',
      '!app/*.html'
    ], { dot: true })
    .pipe(gulp.dest('dist'));
});

/**
 * @name serve:dist
 * @kind task
 *
 * @description
 * Create a production server to show `dist` folder, this task is used when
 * `build` task was executed.
 *
 * @plugins
 *    - gulp
 *    - browser-sync
 *
 * @dependencies {task} build
 */
gulp.task('serve:dist', ['build'], () => {
  browsersync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

/**
 * @name serve
 * @kind task
 *
 * @description
 * Create a development server based on `.tmp` and `app` dirs. Watch changes on
 * `app/templates`, `app/styles` and `app/scripts` files.
 *
 * @plugins
 *    - gulp
 *    - browser-sync
 *
 * @dependencies {task}
 */
gulp.task('serve', ['clean', 'pug', 'sass'], () => {

  browsersync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  gulp.watch([
    'app/*.html',
    '.tmp/*.html'
  ]).on('change', reload);

  gulp.watch('app/templates/**/*.pug', ['pug']).on('change', reload);
  gulp.watch('app/styles/**/*.scss', ['sass']);
});

/**
 * @name build
 * @kind task
 *
 * @description
 * Create a `dist` folder optimizing all `html` files, `images` and copying extra
 * files, and finally, gzip-ing all content.
 *
 * @plugins
 *    - gulp
 *    - gulp-size
 *
 * @dependencies {task} html, images, extras
 * @returns {stream} Stream to indicate that the task is async. Useful to gulp
 *    system to know when it finished.
 */
gulp.task('build', ['html', 'images', 'extras'], () => {
  return gulp
    .src('dist/**/*')
    .pipe($.size({
      title: 'build',
      gzip: true
    }))
    .pipe($.notify({
      title: 'PRODUCTION',
      subtitle: 'Compile',
      message: 'Create optimized version of project'
    }));
});

/**
 * @name default
 * @kind task
 *
 * @description
 * Set the default task to `build` task.
 *
 * @plugins
 *    - gulp
 *
 * @dependencies {task} clean
 */
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
