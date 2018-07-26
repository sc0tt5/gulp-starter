'use strict';

import pkg from './package.json'; // package vars
import gulp from 'gulp';
import karma from 'karma';

// load all plugins in "devDependencies" into the variable $
const $ = require('gulp-load-plugins')({
	pattern: ['*'],
	scope: ['devDependencies'],
	rename: {
		'gulp-clean-css': 'cleancss'
	}
});

// file paths and error notification
const paths = pkg.paths,
	notifyError = $.notify.onError('Error: <%= error.message %>');

// css
//-------------------------------------

// scss to css, then dist
gulp.task('css', () =>
	gulp
		.src(paths.src.scss)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe(
			$.sass({
				outputStyle: 'expanded',
				errLogToConsole: false,
				onError: error => $.notify().write(error)
			})
		)
		.pipe($.autoprefixer('last 3 version', 'safari 5', 'ie 8', 'ie 9'))
		.pipe($.header('/* Auto-generated from src. Do not edit. */\n')) // add comment to top of min file
		.pipe(gulp.dest(paths.dist.base))
);

// css to css min with sourcemaps
gulp.task('cssmin', () =>
	gulp
		.src(paths.dist.css)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.sourcemaps.init())
		.pipe($.cleancss())
		.pipe($.concat('styles.min.css'))
		.pipe($.header('/* Auto-generated from src. Do not edit. */\n')) // add comment to top of min file
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dist.base))
);

// css watcher
gulp.task('css-watch', () =>
	gulp.watch('src/**/*.scss', () => {
		$.sequence('css', 'cssmin', 'html');
	})
);

// lib
//-------------------------------------

// concat libs and add to dist
gulp.task('lib', () => {
	gulp.src(pkg.globs.distJs)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.flatten())
		.pipe($.concat('lib.min.js'))
		.pipe(gulp.dest(paths.dist.base));
});

// js
//-------------------------------------

// es6 to es5, then dist
gulp.task('js', () =>
	gulp
		.src(paths.src.js)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.babel({ presets: ['env'] }))
		.pipe($.header('/* Auto-generated from src. Do not edit. */\n')) // add comment to top of min file
		.pipe(gulp.dest(paths.dist.base))
);

// js to js min
gulp.task('jsmin', () =>
	gulp
		.src(paths.dist.js)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.sourcemaps.init())
		.pipe($.concat('script.min.js'))
		.pipe($.uglify().on('error', error => $.notify(`js task error: ${error}`)))
		.pipe($.header('/* Auto-generated from src. Do not edit. */\n')) // add comment to top of min file
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dist.base))
);

// js watcher
gulp.task('js-watch', () =>
	gulp.watch('src/**/*.js', () => {
		$.sequence('js', 'jsmin', 'html');
	})
);

// html
//-------------------------------------

// html to dist, inject with cssa and js
gulp.task('html', () => {
	let sources = gulp.src([paths.dist.cssmin, paths.dist.lib, paths.dist.jsmin], {
		read: false
	});
	return gulp
		.src(paths.src.html)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.htmlhint())
		.pipe($.htmlhint.failAfterError())
		.pipe($.htmlmin({ collapseWhitespace: true }))
		.pipe($.inject(sources))
		.pipe($.header('<!-- Auto-generated from src. Do not edit. -->\n')) // add comment to top of file
		.pipe(gulp.dest(paths.dist.base));
});

// html watcher
gulp.task('html-watch', () =>
	gulp.watch('src/**/*.html', () => {
		gulp.start('html');
	})
);

// unit test
//-------------------------------------

const Server = karma.Server;

gulp.task('test', done => {
	new Server(
		{
			configFile: __dirname + '/karma.conf.js',
			singleRun: true
		},
		done
	).start();
});

gulp.task('spec-watch', () => {
	gulp.watch('src/**/*.js', ['test']);
});

// build
//-------------------------------------

// build
gulp.task('build', $.sequence('css', 'js', 'lib', 'cssmin', 'jsmin', 'html', 'test'));

// dev (build then watch for changes)
gulp.task('dev', $.sequence('build', 'css-watch', 'js-watch', 'html-watch', 'spec-watch'));

// default
gulp.task('default', () => {
	gulp.start('dev');
});

// reset
//-------------------------------------

gulp.task('reset', () => {
	gulp.src(paths.dist.base, { read: false }).pipe($.clean(paths.dist.base)); // remove dist
});
