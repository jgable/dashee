var path = require('path');

function TestTheme(dashee, config) {
	this.dashee = dashee;
	this.config = config;
}

TestTheme.prototype.load = function (done) {
	var self = this;

	this.dashee.addAssetPath(path.join(__dirname, 'assets'), function () {
		this.loaded = true;

		done(null, self);
	});
};

module.exports = TestTheme;