'use strict';

// package vars
import pkg from './package.json';

// gulp
import gulp from 'gulp';

// load all plugins in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
	pattern: ['*'],
	scope: ['devDependencies'],
	rename: {
		'gulp-clean-css': 'cleancss',
		'gulp-minify-css': 'minifycss'
	}
});

// file paths
const paths = pkg.paths;

// css
//-------------------------------------

// css to src (with sourcemaps) TODO: sourcemaps
gulp.task('css', () =>
	gulp
		.src(paths.src.scss)
		.pipe(
			$.plumber({
				errorHandler: $.notify.onError('Error: <%= error.message %>')
			})
		)
		.pipe($.sass.sync().on('error', $.sass.logError))
		.pipe($.sass({ style: 'compressed' }))
		.pipe($.autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9'))
		.pipe($.cleancss())
		.pipe($.minifycss())
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dist.base))
);

// lib
//-------------------------------------

// concat libs and add to dist
gulp.task('lib', () => {
	gulp.src(pkg.globs.distJs)
		.pipe(
			$.plumber({
				errorHandler: $.notify.onError('Error: <%= error.message %>')
			})
		)
		.pipe($.flatten())
		.pipe($.concat('lib.min.js'))
		.pipe(gulp.dest(paths.dist.base));
});

// js
//-------------------------------------

// js min to dist TODO: sourcemaps
gulp.task('js', () =>
	gulp
		.src(paths.src.js)
		.pipe(
			$.plumber({
				errorHandler: $.notify.onError('Error: <%= error.message %>')
			})
		)
		.pipe(
			$.babel({
				presets: ['env']
			})
		)
		.pipe($.concat('script.min.js'))
		.pipe(
			$.uglify().on('error', e => {
				console.log('js task error: ' + e);
			})
		)
		.pipe(gulp.dest(paths.dist.base))
);

// html
//-------------------------------------

// min files html inject dist
gulp.task('html', () => {
	let sources = gulp.src([paths.dist.css, paths.dist.lib, paths.dist.js], {
		read: false
	});
	return gulp
		.src(paths.src.html)
		.pipe(
			$.plumber({
				errorHandler: $.notify.onError('Error: <%= error.message %>')
			})
		)
		.pipe($.inject(sources))
		.pipe(gulp.dest(paths.dist.base));
});

// build and watch
//-------------------------------------

// web server for testing things out
gulp.task('webserver', () => {
	$.connect.server({
		livereload: true
	});
});

// build
gulp.task('build', $.sequence('css', 'lib', 'js', 'html'));

// dev
gulp.task('dev', () => {
	// kick things off
	gulp.start('build');

	// watch sass
	$.watch(paths.src.scss).on('change', () => {
		$.sequence('css', 'html'); // update html min file
	});
	// watch js
	$.watch(paths.src.js).on('change', () => {
		$.sequence('js', 'html'); // update html min file
	});
	// watch html
	$.watch(paths.src.html).on('change', () => {
		gulp.start('html');
	});
});

// default
gulp.task('default', () => {
	gulp.start('dev');
});

// reset
//-------------------------------------

gulp.task('reset', () =>
	gulp.src(paths.dist.base, { read: false }).pipe($.clean(paths.dist.base))
);
