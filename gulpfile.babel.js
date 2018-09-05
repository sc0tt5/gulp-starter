'use strict';

import pkg from './package.json'; // package vars
import gulp from 'gulp';
import karma from 'karma';

// load all plugins in 'devDependencies' into the variable $
const $ = require('gulp-load-plugins')({
	pattern: ['*'],
	scope: ['devDependencies'],
	rename: {
		'gulp-clean-css': 'cleancss'
	}
});

// public comment for each file
const banner = type => {
	let prefix = {
			js: '/**',
			css: '/*',
			html: '<!--'
		},
		suffix = {
			js: '*/',
			css: '*/',
			html: '-->'
		};

	return `${prefix[type]}
  * @project        ${pkg.name}
  * @author         ${pkg.author}
  * @build          ${$.moment().format('llll')} CT
  * @release        ${$.gitRevSync.long()} [${$.gitRevSync.branch()}]
  * @copyright      Copyright (c) ${$.moment().format('YYYY')}, ${pkg.copyright}
  *
  ${suffix[type]}
 `;
};

const paths = pkg.paths, // file paths
	notifyError = $.notify.onError('Error: <%= error.message %>'); // plumber notification

// gulp plugins configs
const config = {
	// check file contents for change
	changed: { hasChanged: $.changed.compareContents },
	// dev and build server
	connect: {
		dev: {
			root: 'build',
			port: 8001,
			livereload: true
		},
		dist: {
			root: 'public',
			port: 8002,
			livereload: true
		}
	},
	// html
	html: {
		collapseWhitespace: true,
		removeComments: true
	},
	// test runner
	karma: {
		configFile: require('path').resolve('karma.conf.js'),
		singleRun: true
	},
	// image compression
	image: {
		progressive: true,
		interlaced: true,
		optimizationLevel: 7,
		svgoPlugins: [{ removeViewBox: false }],
		verbose: true,
		use: []
	},
	// open in browser
	open: {
		dev: {
			uri: 'http://localhost:8001/'
		},
		dist: {
			uri: 'http://localhost:8002/'
		}
	},
	// css
	sass: {
		outputStyle: 'expanded',
		errLogToConsole: true,
		onError: error => $.notify().write(error)
	},
	// size to console for dev
	size: {
		gzip: true,
		showFiles: true
	},
	// js
	uglify: {
		mangle: true,
		output: { quote_style: 3 },
		compress: {
			booleans: true,
			conditionals: true,
			dead_code: true,
			drop_console: true,
			if_return: true,
			join_vars: true,
			sequences: true,
			unused: true
		}
	}
};

// css
//-------------------------------------

// complile scss to build
gulp.task('css:dev', () =>
		gulp
			.src(paths.src.scss)
			.pipe($.plumber({ errorHandler: notifyError }))
			.pipe($.changed(paths.build.css, config.changed)) // only allow changed files (supports 1:1 only)
			.pipe($.print.default()) // show files coming into stream
			.pipe($.sourcemaps.init({ loadMaps: true }))
			.pipe($.sass(config.sass))
			.pipe($.autoprefixer())
			.pipe($.size(config.size)) // show file size
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest(paths.build.css))
			.pipe($.connect.reload()) // refresh in browser
);

// concat, minimize, and move to public
gulp.task('css:dist', () =>
	gulp
		.src(`${paths.build.css}**/*.css`)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.newer({ dest: paths.dist.css })) // only allow changed files (supports many:1 for when concat)
		.pipe($.print.default())
		.pipe($.concat('styles.min.css'))
		.pipe($.cleancss())
		.pipe($.header(banner('css'), { pkg: pkg })) // comment at top of concat/minified file
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.dist.css))
);

// js
//-------------------------------------

// transpile js to build
gulp.task('js:dev',	() =>
		gulp
			.src(paths.src.js)
			.pipe($.plumber({ errorHandler: notifyError }))
			.pipe($.changed(paths.build.js, config.changed))
			.pipe($.print.default())
			.pipe($.sourcemaps.init({ loadMaps: true }))
			.pipe($.eslint())
			.pipe($.eslint.format())
			.pipe($.eslint.failAfterError())
			.pipe($.babel({ presets: ['env'] }))
			.pipe($.size(config.size))
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest(paths.build.js))
			.pipe($.connect.reload())
);

// concat, minimize, and move to public
gulp.task('js:dist', () =>
	gulp
		.src([`${paths.build.js}/**/*.js`, `!${paths.build.vendor}`])
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.newer({ dest: paths.dist.js }))
		.pipe($.print.default())
		.pipe($.concat('scripts.min.js'))
		.pipe(
			$.uglify(config.uglify).on('error', error => $.notify(`js:dist task error: ${error}`))
		)
		.pipe($.header(banner('js'), { pkg: pkg }))
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.dist.js))
);

// image
//-------------------------------------

// image compression to build
gulp.task('img:dev', () =>
		gulp
			.src(paths.src.img)
			.pipe($.plumber({ errorHandler: notifyError }))
			.pipe($.changed(paths.build.img, config.changed))
			.pipe($.print.default())
			.pipe($.imagemin(config.image))
			.pipe($.size(config.size))
			.pipe(gulp.dest(paths.build.img))
			.pipe($.connect.reload())
);

// image compression to dist
gulp.task('img:dist', () =>
	gulp
		.src(`${paths.build.img}/**/*.{png,jpg,jpeg,gif,svg}`)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.changed(paths.dist.img, config.changed))
		.pipe($.print.default())
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.dist.img))
);

// vendor
//-------------------------------------

// concat libs and add to build
gulp.task('lib:dev', () =>
		gulp
			.src(paths.src.vendor)
			.pipe($.plumber({ errorHandler: notifyError }))
			.pipe($.newer({ dest: paths.build.js }))
			.pipe($.print.default())
			.pipe($.flatten())
			.pipe($.concat('vendor.js'))
			.pipe($.size(config.size))
			.pipe(gulp.dest(paths.build.js))
			.pipe($.connect.reload())
);

// vendor to dist
gulp.task('lib:dist', () =>
	gulp
		.src(paths.build.vendor)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.newer({ dest: paths.dist.js }))
		.pipe($.print.default())
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.dist.js))
);

// html
//-------------------------------------

// html to build, inject with css and js
gulp.task('html:dev', () => {
	// sources for inject
	let css = gulp.src(`${paths.build.css}/**/*.css`, { read: false }),
		vendor = gulp.src(paths.build.vendor, { read: false }),
		js = gulp.src([`${paths.build.js}/**/*.js`, `!${paths.build.vendor}`], { read: false });

	return gulp
		.src(paths.src.html)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.changed(paths.build.base, config.changed))
		.pipe($.print.default())
		.pipe($.htmlhint())
		.pipe($.htmlhint.failAfterError())
		.pipe($.inject(css, { ignorePath: 'build' })) // inject into html
		.pipe($.inject(vendor, { name: 'vendor', ignorePath: 'build' }))
		.pipe($.inject(js, { ignorePath: 'build' }))
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.build.base))
		.pipe($.connect.reload());
});

// html to build, inject with css and js
gulp.task('html:dist', () => {
	// sources for inject
	let css = gulp.src(`${paths.dist.css}/**/*.css`, { read: false }),
		vendor = gulp.src(paths.dist.vendor, { read: false }),
		js = gulp.src([`${paths.dist.js}/**/*.js`, `!${paths.dist.vendor}`], { read: false });

	return gulp
		.src(paths.src.html)
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.newer({ dest: paths.dist.base }))
		.pipe($.print.default())
		.pipe($.inject(css, { ignorePath: 'public' }))
		.pipe($.inject(vendor, { name: 'vendor', ignorePath: 'public' }))
		.pipe($.inject(js, { ignorePath: 'public' }))
		.pipe($.htmlmin(config.html))
		.pipe($.header(banner('html'), { pkg: pkg }))
		.pipe($.size(config.size))
		.pipe(gulp.dest(paths.dist.base));
});

// unit test
//-------------------------------------

const Server = karma.Server;

gulp.task('test', done => {
	new Server(config.karma, done).start();
});

// server
//-------------------------------------

// connect dev
gulp.task('connect:dev', () => {
	$.connect.server(config.connect.dev);
});

// connect dist
gulp.task('connect:dist', () => {
	$.connect.server(config.connect.dist);
});

// close
gulp.task('connect:close', () => {
	$.connect.serverClose();
});

// open in browser dev
gulp.task('open:dev', () => {
	gulp.src('build/index.html')
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.open(config.open.dev));
});

// open in browser dist
gulp.task('open:dist', () => {
	gulp.src('public/index.html')
		.pipe($.plumber({ errorHandler: notifyError }))
		.pipe($.open(config.open.dist));
});

// server rollup tasks
gulp.task('server:dev', $.sequence('connect:dev', 'open:dev')); // used for dev
gulp.task('server:dist', $.sequence('connect:dist', 'open:dist')); // used for prod build

// build
//-------------------------------------

// watch for changes
gulp.task('watch', () => {
	gulp.watch('src/**/*.scss', ['css:dev']);
	gulp.watch('src/**/*.js', ['js:dev']);
	gulp.watch('src/**/*.html', ['html:dist']);
});

// prod build
gulp.task('build', () => {
	$.sequence('css:dist', 'js:dist', 'img:dist', 'lib:dist', 'html:dist', 'server:dist')(error => {
		if (error) {
			$.notify(`dev task gulp-sequence error: ${error}`);
		}
	});
});

// dev build
gulp.task('dev', () => {
	$.sequence('css:dev', 'js:dev', 'img:dev', 'lib:dev', 'html:dev', 'watch', 'server:dev')(
		error => {
			if (error) {
				$.notify(`dev task gulp-sequence error: ${error}`);
			}
		}
	);
});

// default
gulp.task('default', () => {
	gulp.start('dev');
});

// reset
//-------------------------------------

gulp.task('reset', () => {
	gulp.src(paths.dist.base, { read: false }).pipe($.clean(paths.dist.base)); // remove dist
	gulp.src(paths.build.base, { read: false }).pipe($.clean(paths.build.base)); // remove build
});
