/* global chai, describe, before, it */

describe("DasheeApplication", function () {
	var itshould = chai.should(),
		DasheeApplication;

	before(function (done) {
		require(["dashee"], function (_DasheeApplication) {
			DasheeApplication = _DasheeApplication;

			done();
		});
	});

	it("has a load function", function () {
		itshould.exist(DasheeApplication);
		itshould.exist(DasheeApplication.prototype.load);
	});
});