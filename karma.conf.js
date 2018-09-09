module.exports = function(config) {
	config.set({
		basePath: '',
		files: ['src/**/*.js'],
		exclude: [],
		autoWatch: true,
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		preprocessors: {
			'src/**/*.js': ['babel', 'coverage']
		},
		plugins: [
			'karma-babel-preprocessor',
			'karma-coverage',
			'karma-jasmine',
			'karma-jasmine-html-reporter',
			'karma-notify-reporter',
			'karma-phantomjs-launcher'
		],
		reporters: ['coverage', 'kjhtml', 'notify', 'progress'], // kjhtml = debug.html
		client: {
			clearContext: false // leave Jasmine Spec Runner output visible in browser
		},
		coverageReporter: {
			dir: 'tmp',
			type: 'html'
		},
		notifyReporter: {
			reportEachFailure: true,
			reportSuccess: false
		},
		port: 9876,
		colors: true,
		singleRun: false, // Continuous Integration mode - if true, Karma captures browsers, runs the tests and exits
		concurrency: Infinity,
		logLevel: config.LOG_INFO // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	});
};
