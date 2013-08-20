var path = require('path');

var _ = require('lodash');

function DasheeTheme(config) {
    this.config = _.defaults(config || {}, DasheeTheme.DEFAULTS);
}

_.extend(DasheeTheme.prototype, {
    load: function (dashee, done) {
        var self = this,
            fullPathTry = path.join(process.cwd(), this.config.name),
            RequiredTheme,
            loadedCallback = function (err) {
                self.loadedTheme = RequiredTheme;
                
                // Report an error, or return the loaded theme
                done(err, RequiredTheme);
            };
        
        // Try to require the theme by string passed
        try {
            RequiredTheme = require(this.config.name);
        } catch(e) {
            try {
                // Try to require the theme by full path
                RequiredTheme = require(fullPathTry);
            } catch (fullPathE) {
                return done(new Error("Unable to find the theme with name or path: " + this.config.name + ".  Tried by name and " + fullPathTry));
            }
        }

        // Instantiate if it's a class
        if (_.isFunction(RequiredTheme)) {
            RequiredTheme = new RequiredTheme(dashee, this.config);
        }

        // Throw error if no load function
        if (!_.isFunction(RequiredTheme.load)) {
            return done(new Error("Theme does not have load function defined: " + this.config.name));
        }
        
        // Load the theme
        if (RequiredTheme.load.length > 1) {
            RequiredTheme.load(dashee, this.config, loadedCallback);
        } else {
            RequiredTheme.load(loadedCallback);
        }
        
    }
});

DasheeTheme.DEFAULTS = {

};

module.exports = DasheeTheme;