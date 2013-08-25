var path = require('path');

var uuid = require('uuid'),
    _ = require('lodash');

function DasheeBlock(name, config) {
    this.name = name;
    this.config = _.defaults(config || {}, DasheeBlock.DEFAULTS);

    config.id = config.id || uuid.v4();

    this.id = config.id;
}

_.extend(DasheeBlock.prototype, {
    load: function (dashee, done) {
        var self = this,
            fullPathTry = path.join(process.cwd(), this.name),
            RequiredBlock,
            loadedCallback = function (err) {
                self.loadedBlock = RequiredBlock;
                
                // Report an error, or return the loaded block
                done(err, RequiredBlock);
            };
        
        // Try to require the block by string passed
        try {
            RequiredBlock = require(this.name);
        } catch(e) {
            try {
                // Try to require the block by full path
                RequiredBlock = require(fullPathTry);
            } catch (fullPathE) {
                console.log(fullPathE);
                return done(new Error("Unable to require the block with name or path: " + this.name + ".  Tried by name and " + fullPathTry));
            }
        }

        // Instantiate if it's a class
        if (_.isFunction(RequiredBlock)) {
            RequiredBlock = new RequiredBlock(dashee, this.config);
        }

        this.RequiredBlock = RequiredBlock;

        // Throw error if no load function
        if (!_.isFunction(RequiredBlock.load)) {
            return done(new Error("Block does not have load function defined: " + this.name));
        }
        
        // Load the block
        if (RequiredBlock.load.length > 1) {
            RequiredBlock.load(dashee, this.config, loadedCallback);
        } else {
            RequiredBlock.load(loadedCallback);
        }
    },

    // Empty render stub
    render: function (done) {
        this.RequiredBlock.render(done);
    }
});

DasheeBlock.DEFAULTS = {

};

module.exports = DasheeBlock;