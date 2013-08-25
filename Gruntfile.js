
module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var cfg = {
        jshint2: {
            options: {
                jshintrc: ".jshintrc"
            },
            lib: ["*.js", "lib/**/*.js"],
            test: ["test/**/*.js", "!test/client/assets/*.js"],
            client: {
                files: {
                    src: ['assets/js/**/*.js', '!assets/js/vendor/**/*.js']
                },
                options: {
                    jshint: {
                        browser: true
                    },
                    globals: {
                        "_": false,
                        "jQuery": false,
                        "Backbone": false,
                        "define": false,
                        "Faye": false
                    }
                }
            }
        },

        mochacli: {
            options: {
                ui: "bdd",
                reporter: "spec"
            },
            all: ["test/**/*_spec.js"]
        },

        clean: {
            client: ["assets/js/dashee.js"]
        },

        copy: {
            client: {
                files: {
                    "assets/js/dashee.js": "assets/js/dashee.js.ejs"
                },
                options: {
                    processContent: function (contents) {
                        contents = contents.replace("<%= dasheeBlocksObject() %>", "{}");
                        contents = contents.replace("<%= dasheeSocketsUrl() %>", "http://localhost:4000/live");
                    }
                }
            }
        },

        express: {
            client_tests: {
                options: {
                    script: "test/client/server.js"
                }
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    urls: [
                        "http://localhost:4000/"
                    ]
                }
            }
        }
    };

    grunt.initConfig(cfg);

    grunt.registerTask("test_client", ["express", "mocha_phantomjs"]);
    grunt.registerTask("validate", ["copy:client", "jshint2", "clean:client", "mochacli", "test_client"]);
    grunt.registerTask("default", ["validate"]);
};