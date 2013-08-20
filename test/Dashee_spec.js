/* global describe, beforeEach, afterEach, it */

var should = require('should'),
    sinon = require('sinon');

var Dashee = require('../lib/Dashee');

describe("Dashee", function () {

    var sandbox;

    should.exist(Dashee);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("can load a config", function (done) {
        var dashee = new Dashee(),
            config = {

            };

        sandbox.stub(dashee, "loadServer", function (_, done) {
            done(null, "server");
        });

        sandbox.stub(dashee, "loadTheme", function (_, done) {
            done(null, "theme");
        });

        sandbox.stub(dashee, "loadBlocks", function (_, done) {
            done(null, "blocks");
        });

        dashee.load(config, function (err) {
            if (err) { throw err; }

            dashee.config.should.eql(config);

            dashee.server.should.equal("server");
            dashee.theme.should.equal("theme");
            dashee.blocks.should.equal("blocks");

            done();
        });
    });
});