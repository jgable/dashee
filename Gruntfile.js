

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var cfg = {
        jshint2: {
            options: {
                jshintrc: ".jshintrc"
            },
            lib: ["*.js", "lib/**/*.js"],
            test: ["test/**/*.js"]
        },

        mochacli: {
            options: {
                ui: "bdd",
                reporter: "spec"
            },
            all: ["test/**/*_spec.js"]
        }
    };

    grunt.initConfig(cfg);

    grunt.registerTask("validate", ["jshint2", "mochacli"]);
    grunt.registerTask("default", ["validate"]);
};