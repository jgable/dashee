/* global describe, beforeEach, afterEach, it */

var http = require('http'),
    path = require('path');

var _ = require("lodash"),
    should = require('should'),
    sinon = require('sinon');

var DasheeServer = require('../lib/Server');

describe("DasheeServer", function () {

    var sandbox,
        server;

    should.exist(DasheeServer);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        server = new DasheeServer({}, {});
    });

    afterEach(function (done) {
        sandbox.restore();

        if (server.httpServer) {
            server.httpServer.close(function (err) {
                if (err) { throw err; }
                done();
            });
        } else {
            done();
        }
        
    });

    it("starts an express server", function (done) {
        // Default port info
        server.config.port.should.equal(3000);

        server.start(function (err, startedServer) {
            if (err) {
                throw err;
            }

            // TODO: These tests are kind of naive

            should.exist(startedServer.app);

            _.isFunction(startedServer.app.get).should.equal(true);

            done();
        });
    });

    it("can add theme assets", function (done) {
        this.timeout(10000);

        server.config.port = 7357;

        server.addAssetPaths('/assets/test', path.join(__dirname, '..', 'assets', 'js'), function (err) {
            if (err) { throw err; }

            server.start(function (err) {
                if (err) { throw err; }

                server.getAssetPath('/assets/test', 'dashee.js', function (err, dasheePath) {
                    if (err) { throw err; }

                    http.get('http://localhost:7357/assets/test/' + dasheePath, function (res) {
                        should.exist(res);
                        should.exist(res.statusCode);

                        res.statusCode.should.equal(200);

                        var fileContents = "";
                        res.on('data', function (chunk) {
                            fileContents += chunk.toString();
                        });

                        res.on('end', function () {
                            fileContents.length.should.be.above(0);

                            done();
                        });
                    }).on('error', function (err) {
                        throw err;
                    });
                });
            });
        });
    });

    it("can get all asset paths", function (done) {

        server.addAssetPaths('/assets/test', path.join(__dirname, 'themes', 'test', 'assets'), function (err) {
            if (err) { throw err; }

            server.addAssetPaths("/assets/dashee", path.join(__dirname, '..', 'assets'), function (err) {
                if (err) { throw err; }

                server.getAssetsPaths(function (err, assetsPaths) {
                    if (err) { throw err; }

                    should.exist(assetsPaths);

                    should.exist(assetsPaths['/assets/test/js/main.js']);

                    done();
                });

            });
        });
    });
});