/* global describe, beforeEach, afterEach, it */

var _ = require("lodash"),
    should = require('should'),
    sinon = require('sinon');

var DasheeServer = require('../lib/Server');

describe("DasheeServer", function () {

    var sandbox;

    should.exist(DasheeServer);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("starts an express server", function (done) {
        var server = new DasheeServer({});

        // Default port info
        server.config.port.should.equal(3000);

        server.start(null, function (err, startedServer) {
            if (err) {
                throw err;
            }

            // TODO: These tests are kind of naive

            should.exist(startedServer.app);

            _.isFunction(startedServer.app.get).should.equal(true);

            done();
        });
    });
});