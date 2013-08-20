var express = require("express"),
    hbs = require("express-hbs"),
    Mincer = require("mincer"),
    _ = require("lodash");

function DasheeServer(config) {
    this.config = _.defaults(config || {}, DasheeServer.DEFAULTS);
}

_.extend(DasheeServer.prototype, {
    start: function (dashee, done) {
        var self = this,
            app = express();

        app.configure("development", function () {
            app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
            app.use(express.logger('dev'));
        });
        
        this.app = app;

        this.viewEngine = this.registerViewEngine();

        this.app.listen(this.config.port, this.config.host, function (err) {
            if (err) {
                return done(err);
            }

            done(null, self);
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

    addAssetPaths: function (root, paths, done) {

        // Convert non array paths to an array
        if (!_.isArray(paths)) {
            paths = [paths];
        }

        // Mincer environment creation and path registration
        var environment = Mincer.Environment();

        paths.forEach(function (path) {
            environment.appendPath(path);
        });

        // Register the assets handler
        this.app.use(root, Mincer.createServer(environment));

        // TODO: Compile the assets?
        process.nextTick(function () {
            done();
        });
    }
});

// Static DEFAULTS value for checking
DasheeServer.DEFAULTS = {
    port: process.env.PORT || 3000,
    host: "localhost"
};

module.exports = DasheeServer;