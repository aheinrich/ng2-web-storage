module.exports = function (config) {
    config.set({
        
        basePath: '..',
        
        frameworks: ['jasmine'],
        
        files: [
            // Polyfills
            { pattern: 'node_modules/es6-shim/es6-shim.js', included: true, watched: false },
            { pattern: 'node_modules/reflect-metadata/Reflect.js', included: true, watched: false },
            
            // System.js for module loading
            { pattern: 'node_modules/systemjs/dist/system-polyfills.js', included: true, watched: false },
            { pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: false },
            
            // Zone.js dependencies
            { pattern: 'node_modules/zone.js/dist/zone.js', included: true, watched: false },
            { pattern: 'node_modules/zone.js/dist/jasmine-patch.js', included: true, watched: false },
            { pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false },
            { pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false },
            
            // RxJS
            { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
            { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },
            
            // Karma Shim?
            { pattern: 'config/karma-test-shim.js', included: true, watched: true },

            // paths loaded via module imports
            
            // Angular itself
            {pattern: 'node_modules/@angular/**/*.js', included: false, watched: true},
            {pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: true},
            
            // Our built application code
            {pattern: 'build/**/*.js', included: false, watched: true},
            {pattern: 'build/**/*.html', included: false, watched: true},
            {pattern: 'build/**/*.css', included: false, watched: true},
            
        ],
        
        // proxied base paths
        // required for component assests fetched by Angular's compiler
        proxies: {
            "/app/": "/base/build/app/",
            "/node_modules/": "/base/node_modules/"
        },
        
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true
    });
};
