
function Test1Block(dashee, config) {
	this.dashee = dashee;
    this.config = config || {};
}

Test1Block.prototype.load = function (done) {
    this.loaded = true;

    this.name = "block2";
    
    return done(null, this);
};

module.exports = Test1Block;