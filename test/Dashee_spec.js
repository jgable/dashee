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
        var config = {
                theme: "test",
                test: true
            },
            fakeTheme = {
                registerViewRoutes: sandbox.spy()
            },
            fakeServer = {
                registerViewRoot: sandbox.spy()
            },
            dashee = new Dashee(config);
            

        sandbox.stub(dashee, "loadServer", function (done) {
            dashee.server.app = {
                set: sandbox.spy()
            };

            dashee.server.registerClientBlocks = sandbox.spy();
            
            done(null, fakeServer);
        });

        sandbox.stub(dashee, "loadTheme", function (_, done) {
            done(null, fakeTheme);
        });

        sandbox.stub(dashee, "loadBlocks", function (_, done) {
            done(null, "blocks");
        });

        dashee.load(function (err) {
            if (err) { throw err; }

            dashee.config.should.eql(config);

            dashee.loadServer.called.should.equal(true);
            dashee.theme.should.equal(fakeTheme);
            dashee.blocks.should.equal("blocks");

            done();
        });
    });
});