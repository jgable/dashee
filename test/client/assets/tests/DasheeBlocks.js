/* global require, chai, describe, before, it */

describe("DasheeBlocks", function () {
	var itshould = chai.should(),
		DasheeBlocks;

	before(function (done) {
		require(['dashee/block'], function (_DasheeBlocks) {
			DasheeBlocks = _DasheeBlocks;

			done();
		});
	});

	it("should have a model and a view to extend", function () {
		itshould.exist(DasheeBlocks);
		itshould.exist(DasheeBlocks.Model);
		itshould.exist(DasheeBlocks.View);
	});
});