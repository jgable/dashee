var _ = require("lodash"),
    async = require("async");

var DasheeServer = require("./Server"),
    DasheeTheme = require("./Theme"),
    DasheeBlock = require("./Block");

function Dashee(opts) {
    this.opts = opts || {};
}

_.extend(Dashee.prototype, {
    // Load the express server, theme and blocks
    load: function (config, done) {
        var self = this;

        this.config = _.defaults(config || {}, Dashee.DEFAULTS);

        this.loadServer(this.config.server, function (err, server) {
            if (err) { return done(err); }

            self.server = server;

            self.loadTheme(self.config.theme, function (err, theme) {
                if (err) { return done(err); }

                self.theme = theme;

                self.loadBlocks(self.config.blocks, function (err, blocks) {
                    if (err) { return done(err); }

                    self.blocks = blocks;

                    done(null, self);
                });
            });
        });
    },

    loadServer: function (serverConfig, done) {
        var server = new DasheeServer(serverConfig);

        server.start(this, done);
    },

    loadTheme: function (themeConfig, done) {
        // Correct for just specifying a string as the theme
        if (_.isString(themeConfig)) {
            themeConfig = {
                name: themeConfig
            };
        }
        
        var theme = new DasheeTheme(themeConfig, done);

        theme.load(this._getThemeHelpers(), done);
    },

    loadBlocks: function (blocksConfig, done) {
        var self = this,
            blocks = _.flatten(_.map(blocksConfig, function (blockName, configs) {
            // Default to an array for consistency
            if (!_.isArray(configs)) {
                configs = [configs];
            }

            // Return an array of instantiated blocks
            return _.map(configs, function (blockConfig) {
                return new DasheeBlock(blockName, blockConfig);
            });
        }));

        // Wrapper for calling the load function on each block
        function loadBlock(block, cb) {
            block.load(self._getBlockHelpers(block), cb);
        }

        // Load each block in series
        async.mapSeries(blocks, loadBlock, function (err, loadedBlocks) {
            if (err) {
                return done(err);
            }

            done(null, loadedBlocks);
        });
    },

    _getBaseHelpers: function () {
        var self = this;

        return {
            get: function () {
                self.server.app.get.apply(self.server.app, _.toArray(arguments));
            },

            post: function () {
                self.server.app.post.apply(self.server.app, _.toArray(arguments));
            },

            put: function () {
                self.server.app.put.apply(self.server.app, _.toArray(arguments));
            }
        };
    },

    _getThemeHelpers: function () {
        var self = this;
        
        return _.extend(this._getBaseHelpers(), {
            addAssetPaths: function (paths, done) {
                self.server.addAssetPaths("/assets/theme", paths, done);
            },

            app: this.server
        });
    },

    _getBlockHelpers: function (block) {
        var self = this;

        return _.extend(this._getBaseHelpers(), {
            addAssetPaths: function (paths, done) {
                self.server.addAssetPaths("/assets/block-" + block.id, paths, done);
            },

            pushData: function (data, done) {
                self.server.pushData(block.id, data, done);
            }
        });
    }
});

Dashee.DEFAULTS = {
    theme: "dashee-theme-dark",

    server: {

    },

    blocks: {

    }
};

module.exports = Dashee;