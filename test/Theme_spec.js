/* global describe, beforeEach, afterEach, it */

var should = require('should'),
    sinon = require('sinon');

var DasheeTheme = require('../lib/Theme');

describe("DasheeTheme", function () {

    var sandbox;

    should.exist(DasheeTheme);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("loads a theme by path", function (done) {
        var fakeDashee = {
                addAssetPaths: sinon.spy(function (paths, cb) {
                    process.nextTick(function () {
                        cb();
                    });
                })
            },
            theme = new DasheeTheme(fakeDashee, {
                name: "./test/themes/test",
                option: "1"
            });

        

        theme.load(function (err, loadedTheme) {
            if (err) {
                throw err;
            }

            should.exist(loadedTheme);

            fakeDashee.addAssetPaths.called.should.equal(true);

            done();
        });
    });
});