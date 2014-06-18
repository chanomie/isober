// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js',
    paths: {
    	jquery: 'jquery-2.1.1.min',
    	underscore: 'underscore-min',
        main: 'main'
    },
    urlArgs: "bust=" + (+new Date)
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['jquery','underscore','main']);