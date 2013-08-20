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
        var theme = new DasheeTheme({
                name: "./test/themes/test",
                option: "1"
            }),
            fakeDashee = {
                addAssetPath: function () {
                    return;
                }
            };

        sandbox.stub(fakeDashee, "addAssetPath", function (path, done) {
            process.nextTick(function () {
                done();
            });
        });

        theme.load(fakeDashee, function (err, loadedTheme) {
            if (err) {
                throw err;
            }

            should.exist(loadedTheme);

            fakeDashee.addAssetPath.called.should.equal(true);

            done();
        });
    });
});