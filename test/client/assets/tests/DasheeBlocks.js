/* global sinon, require, chai, describe, before, beforeEach, afterEach, it */

describe("DasheeBlocks", function () {
    var itshould = chai.should(),
        sandbox,
        DasheeBlocks;

    before(function (done) {
        require(['dashee/block'], function (_DasheeBlocks) {
            DasheeBlocks = _DasheeBlocks;

            done();
        });
    });

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("should have a model and a view to extend", function () {
        itshould.exist(DasheeBlocks);
        itshould.exist(DasheeBlocks.Model);
        itshould.exist(DasheeBlocks.View);
    });

    describe("Model", function () {
        var fakeSockets;

        beforeEach(function () {
            fakeSockets = {
                subscribe: sandbox.spy(function () {
                    return {
                        cancel: sandbox.stub()
                    };
                })
            };

            sandbox.stub(DasheeBlocks.Model.prototype, "connectSockets", function () {
                return fakeSockets;
            });
        });


        it("registers data and error events by default", function () {
            var model = new DasheeBlocks.Model({ id: "test1" });

            var chans = model.channels();

            itshould.exist(chans);

            itshould.exist(chans["/blocks/" + model.id + "/data"]);
            itshould.exist(chans["/blocks/" + model.id + "/error"]);
        });

        it("auto listens", function () {
            var listenStub = sandbox.stub(DasheeBlocks.Model.prototype, "listen");

            var model = new DasheeBlocks.Model({ id: "test1" });

            model.autoListen.should.equal(true);
            listenStub.called.should.equal(true);
        });

        it("calls subscribe for each channel", function () {
            var scribeStub = sandbox.stub(DasheeBlocks.Model.prototype, "subscribe");

            var model = new DasheeBlocks.Model({ id: "test1" });

            model.autoListen.should.equal(true);

            scribeStub.calledTwice.should.equal(true);
            scribeStub.calledWith("/blocks/test1/data").should.equal(true);
            scribeStub.calledWith("/blocks/test1/error").should.equal(true);
        });

        it("keeps track of subscriptions", function () {
            var model = new DasheeBlocks.Model({ id: "test1" }),
                channelName = "/blocks/test1/testing",
                onEvent = sandbox.spy();

            model.autoListen.should.equal(true);

            itshould.not.exist(model.subscriptions[channelName]);

            model.subscribe(channelName, onEvent);

            itshould.exist(model.subscriptions[channelName]);
        });
    });

    describe("View", function () {

    });
});