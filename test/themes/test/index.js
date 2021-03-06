var path = require('path');

function TestTheme(dashee, config) {
	this.dashee = dashee;
	this.config = config;

	this.name = "dashee-theme-test";
}

TestTheme.prototype.load = function (done) {
	var self = this;

	this.dashee.addAssetPaths(path.join(__dirname, 'assets'), function () {
		this.loaded = true;

		done(null, self);
	});
};

module.exports = TestTheme;