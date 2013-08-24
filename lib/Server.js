var http = require('http'),
    path = require('path');

var express = require("express"),
    hbs = require("express-hbs"),
    Mincer = require("mincer"),
    _ = require("lodash");

function DasheeServer(dashee, config) {
    _.bindAll(this, "getAssetPath", "getDasheeJs");

    this.dashee = dashee;
    this.config = _.defaults(config || {}, DasheeServer.DEFAULTS);

    this.environments = { };
}

_.extend(DasheeServer.prototype, {
    start: function (done) {
        var self = this,
            app = express();

        app.configure("development", function () {
            app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
            app.use(express.logger('dev'));

            app.set('development', true);
        });
        
        this.app = app;

        this.viewEngine = this.registerViewEngine();

        this.addAssetPaths("/assets/dashee", path.join(__dirname, '..', 'assets'), function (err) {
            if (err) { return done(err); }

            self.getAssetsPaths(function (err, assetsPaths) {
                if (err) { return done(err); }

                self.assetsPaths = assetsPaths;

                self.registerHelpers();

                _.each(self.environments, function (environment, root) {
                    if (self.isProduction()) {
                        environment.cssCompressor = "csso";
                        environment.jsCompressor = "uglify";

                        environment = environment.index;
                    }

                    app.use(root, Mincer.createServer(environment));
                });

                self.httpServer = http.createServer(app);

                self.httpServer.listen(self.config.port, self.config.host, function (err) {
                    if (err) {
                        return done(err);
                    }

                    done(null, self);
                });
            });
        });
    },

    // Allows for overriding the view engine
    registerViewEngine: function () {
        this.app.engine('hbs', hbs.express3({
            // TODO: Partials loading?
            //partialsDir: __dirname + '/views/partials'
        }));

        this.app.set('view engine', 'hbs');

        return hbs;
    },

    registerHelpers: function () {
        var self = this;
        
        // Helpers for assets
        hbs.registerHelper('assetPath', function (path) {
            return self.assetsPaths[path] || path;
        });

        // Helpers for the dashee js script tag
        hbs.registerHelper('dasheeJS', function () {
            var dasheePath = "/assets/dashee/js/dashee.js";

            return "<script src='" + self.assetsPaths[dasheePath] + "'></script>";
        });

        // Block styles
        hbs.registerHelper('dasheeBlockStyles', function () {
            var blockPaths = {};

            _.each(self.assetsPaths, function (digestPath) {
                if (digestPath.slice(0, 14) === '/assets/block-' && digestPath.slice(-4) === '.css') {
                    blockPaths[digestPath] = true;
                }
            });

            return _.map(blockPaths, function (v, path) {
                return '<link rel="stylesheet" href="' + path + '">';
            }).join('\n');
        });

        // Block scripts
        hbs.registerHelper('dasheeBlockScripts', function () {
            var scriptPaths = {};

            console.log("dasheeBlockScripts");
            _.each(self.assetsPaths, function (digestPath) {
                console.log("- ", digestPath, digestPath.slice(0, 14), digestPath.slice(-3));
                if (digestPath.slice(0, 14) === '/assets/block-' && digestPath.slice(-3) === '.js') {
                    scriptPaths[digestPath] = true;
                }
            });

            return _.map(scriptPaths, function (v, path) {
                return '<script src="' + path + '"></script>';
            }).join('\n');
        });
    },

    registerViewRoot: function (path) {
        this.app.set('views', path);
    },

    registerClientBlocks: function (blocks) {
        this.blocks = blocks;
    },

    getAssetPath: function (root, path, done) {
        var found = this.environments[root].findAsset(path) || {};

        // TODO: Special "not found" path?
        done(null, found.digestPath || "");
    },

    getAssetsPaths: function (done) {
        var result = {};

        _.each(this.environments, function (environment, environRoot) {
            environment.eachLogicalPath([function () { return true; }], function (logicalPath) {
                // Find asset and get digest path
                var origPath = [environRoot, logicalPath].join('/'),
                    asset = environment.findAsset(logicalPath),
                    digestPath = origPath;

                if (asset && asset.digestPath) {
                    digestPath = [environRoot, asset.digestPath].join('/');
                }

                result[origPath] = digestPath;
            });
        });

        done(null, result);
    },

    getDasheeJs: function (data, done) {
        var self = this;

        self.getAssetPath("/assets/dashee", "js/dashee.js", function (err, dasheePath) {
            if (err) { return done(err); }

            done("<script src='/assets/dashee/" + dasheePath + "'></script>");
        });
    },

    addAssetPaths: function (root, paths, done) {
        var self = this,
            environment;

        // Convert non array paths to an array
        if (!_.isArray(paths)) {
            paths = [paths];
        }

        // Mincer environment creation and path registration
        if (!this.environments[root]) {
            this.environments[root] = environment = new Mincer.Environment();

            // Some hackery here for letting client js files get block info
            // TODO: Make one that just outputs the object so it can be used more widely
            environment.registerHelper('dasheeBlocksDefine', function () {

                // Build up the 'id': 'dashee-block-stocks' pieces
                var mappings = _.map(self.blocks, function (block) {
                    return "'" + block.id + "': '" + block.name + "'";
                }).join(',\n    ');
                
                // Put it all together nicely
                return "define('dashee/blocks', [], function () {\n" +
                    "  return {\n" +
                    "    " + mappings + "\n" +
                    "  };\n" +
                    "});";
            });
            

            if (this.isProduction()) {
                environment.cache = new Mincer.FileStore(this.config.cacheFolder);
            }
        }

        environment = this.environments[root];

        paths.forEach(function (path) {
            environment.appendPath(path);
        });

        // TODO: Compile the assets?
        process.nextTick(function () {
            done(null, environment);
        });
    },

    isProduction: function () {
        if (this.config.mode) {
            return this.config.mode === "production";
        }

        // Otherwise, check the NODE_ENV value
        return process.env === "production";
    }
});

// Static DEFAULTS value for checking
DasheeServer.DEFAULTS = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
    cacheFolder: path.join(__dirname, '..', 'builtAssets'),
    mode: null
};

module.exports = DasheeServer;