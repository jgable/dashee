/* global describe, beforeEach, afterEach, it */

var fs = require('fs'),
    path = require('path');

var should = require('should'),
    sinon = require('sinon'),
    rimraf = require('rimraf');

var DasheeBlock = require('../lib/Block');

describe("DasheeBlock", function () {

    var sandbox,
        testModuleDir = path.join(process.cwd(), "node_modules", "dashee-block-test1"),
        createTestBlockModule = function () {
            fs.mkdirSync(testModuleDir);
            fs.writeFileSync(path.join(testModuleDir, "index.js"), fs.readFileSync("./test/blocks/block2.js"));
        };

    should.exist(DasheeBlock);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function (done) {
        sandbox.restore();

        rimraf(testModuleDir, function (err) {
            if (err) { throw err; }

            done();
        });
    });

    it("can load a block by file path", function (done) {
        var block = new DasheeBlock("./test/blocks/block1.js", {
            test1: true,
            test2: false
        });

        should.exist(block.id);

        block.load(null, function (err, loadedBlock) {
            if (err) {
                throw err;
            }

            should.exist(loadedBlock);

            block.loadedBlock.should.eql(loadedBlock);

            loadedBlock.loaded.should.equal(true);
            loadedBlock.config.test1.should.equal(true);

            done();
        });
    });

    it("can load a block by module name", function (done) {

        createTestBlockModule();
        
        var block = new DasheeBlock("dashee-block-test1", {
            test1: false,
            test2: true
        });

        should.exist(block.id);

        block.load(null, function (err, loadedBlock) {
            if (err) {
                throw err;
            }

            should.exist(loadedBlock);

            block.loadedBlock.should.eql(loadedBlock);

            loadedBlock.loaded.should.equal(true);
            loadedBlock.config.test1.should.equal(false);
            loadedBlock.config.test2.should.equal(true);
            loadedBlock.name.should.equal("block2");

            done();
        });
    });
});