/* global describe, beforeEach, afterEach, it */

var path = require('path');

var should = require('should'),
    sinon = require('sinon');

var Dashee = require('../lib/Dashee');

describe("Dashee", function () {

    var sandbox,
        config,
        fakeTheme,
        fakeServer,
        dashee;

    should.exist(Dashee);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        config = {
            theme: "test",
            test: true
        };
        fakeTheme = {
            registerViewRoutes: sandbox.spy()
        };
        fakeServer = {
            registerViewRoot: sandbox.spy()
        };
        dashee = new Dashee(config);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("can load a config", function (done) {
        sandbox.stub(dashee, "loadTheme", function (_, done) {
            done(null, fakeTheme);
        });

        sandbox.stub(dashee, "loadBlocks", function (_, done) {
            done(null, "blocks");
        });

        sandbox.stub(dashee, "loadServer", function (done) {
            dashee.server.app = {
                set: sandbox.spy()
            };

            dashee.server.registerClientBlocks = sandbox.spy();
            
            done(null, fakeServer);
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

    it("can start the server", function (done) {
        dashee.server = {
            start: sandbox.spy(function (cb) {
                cb();
            })
        };

        dashee.loadServer(function (err) {
            if (err) { throw err; }

            dashee.server.start.called.should.equal(true);

            done();
        });
    });

    it("can load a theme by name", function (done) {
        var themePath = path.join(__dirname, 'themes', 'test');
        sandbox.spy(dashee, "_getThemeHelpers");

        dashee.server = {
            app: "test",
            addAssetPaths: sandbox.spy(function (root, paths, done) {
                return done();
            })
        };

        dashee.loadTheme(themePath, function (err, theme) {
            if (err) { throw err; }

            dashee._getThemeHelpers.called.should.equal(true);

            should.exist(theme);

            theme.name.should.equal("dashee-theme-test");

            done();
        });
    });

    it("can load blocks", function (done) {
        var blocks = {
                "test/blocks/block1": {
                    test: 1
                },
                "test/blocks/block2": {
                    test: 2
                }
            };

        dashee.loadBlocks(blocks, function (err, loaded) {
            if (err) { throw err; }

            should.exist(loaded);

            loaded.length.should.equal(2);

            loaded[0].config.test.should.equal(1);
            loaded[1].config.test.should.equal(2);

            done();
        });


    });
});