var _ = require("lodash"),
    async = require("async");

var DasheeServer = require("./Server"),
    DasheeTheme = require("./Theme"),
    DasheeBlock = require("./Block");

function Dashee(config) {
    this.config = _.defaults(config || {}, Dashee.DEFAULTS);
}

_.extend(Dashee.prototype, {
    // Load the express server, theme and blocks
    load: function (done) {
        var self = this;

        this.server = new DasheeServer(this._getServerHelpers(), this.config.server);

        // Load the theme
        self.loadTheme(self.config.theme, function (err, theme) {
            if (err) { return done(err); }

            self.theme = theme;

            // Load the blocks
            self.loadBlocks(self.config.blocks, function (err, blocks) {
                if (err) { return done(err); }

                self.blocks = blocks;
                self.server.registerClientBlocks(self.blocks);

                // Start the server
                self.loadServer(function (err) {
                    if (err) { return done(err); }

                    // Register the view routes, now that the server is running
                    self.theme.registerViewRoutes();
                    self.server.registerViewRoot(self.theme.viewRoot);

                    done(null, self);
                });
            });
        });
    },

    loadServer: function (done) {
        this.server.start(done);
    },

    loadTheme: function (themeConfig, done) {
        // Correct for just specifying a string as the theme
        if (_.isString(themeConfig)) {
            themeConfig = {
                name: themeConfig
            };
        }
        
        var theme = new DasheeTheme(this._getThemeHelpers(), themeConfig);

        theme.load(done);
    },

    loadBlocks: function (blocksConfig, done) {
        var self = this,
            blocks = _.flatten(_.map(blocksConfig, function (configs, blockName) {
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
            use: function () {
                self.server.app.use.apply(self.server.app, _.toArray(arguments));
            },

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

    _getServerHelpers: function () {
        return {
            
        };
    },

    _getThemeHelpers: function () {
        var self = this;
        
        return _.extend(this._getBaseHelpers(), {
            getBlocksHtml: function (done) {

                if (self.blocks.length < 1) {
                    return done(null, []);
                }
                
                function renderBlock(block, cb) {
                    block.render(function (err, html) {
                        if (err) { return cb(err); }

                        cb(null, {
                            id: block.id,
                            name: block.name,
                            html: html
                        });
                    });
                }

                async.map(self.blocks, renderBlock, function (err, renderedBlocks) {
                    if (err) { return done(err); }

                    done(null, renderedBlocks);
                });
            },

            getAssetsPaths: function (done) {
                self.server.getAssetsPaths(function (err, assetsPaths) {
                    if (err) { return done(err); }

                    // TODO: modification?

                    done(null, assetsPaths);
                });
            },

            addAssetPaths: function (paths, done) {
                self.server.addAssetPaths("/assets/theme", paths, done);
            },

            registerViewRoot: function (path) {
                self.server.registerViewRoot(path);
            },

            app: this.server.app
        });
    },

    _getBlockHelpers: function (block) {
        var self = this;

        return _.extend(this._getBaseHelpers(), {
            addAssetPaths: function (paths, done) {
                self.server.addAssetPaths("/assets/block-" + block.name, paths, done);
            },

            pushData: function (data, done) {
                self.server.sendBlockData(block.id, data, done);
            }
        });
    }
});

Dashee.DEFAULTS = {
    theme: "dashee-theme-default",

    server: {

    },

    blocks: {

    }
};

module.exports = Dashee;