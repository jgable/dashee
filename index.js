var _ = require('lodash');

var lib = require('./lib');

module.exports = _.extend(lib, {
    load: function (config, done) {
        var api = new lib.Dashee(config);

        api.load(done);
    }
});