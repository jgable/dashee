
var path = require('path'),
    http = require('http');

var _ = require('lodash'),
    express = require('express'),
    Mincer = require("mincer"),
    hbs = require('express-hbs'),
    faye = require('faye');

var app = express();

app.engine('hbs', hbs.express3({

}));

app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, "views"));

var environment = new Mincer.Environment();

environment.appendPath(path.join(__dirname, "..", "..", "assets", "js"));
environment.appendPath(path.join(__dirname, 'assets'));

hbs.registerHelper('assetPath', function (path) {
    var found = environment.findAsset(path);

    return (found && found.digestPath) || path;
});

environment.registerHelper("dasheeSocketsUrl", function () {
    return "http://localhost:4000/live";
});

var blocksObject = {};
environment.registerHelper("dasheeBlocksObject", function () {
    return JSON.stringify(blocksObject);
});

app.use("/assets", Mincer.createServer(environment));

var allTests = [
    "DasheeBlocks",
    "DasheeApplication"
];

app.get('/', function (req, res) {
    var testFiles = _.map(allTests, function (n) {
        return {
            name: n
        };
    });
    res.render("index", { tests: testFiles });
});

app.get('/test/:name', function (req, res) {
    res.render("index", { tests: [{ name: req.params.name }] });
});

var server = http.createServer(app);

var bayeux = new faye.NodeAdapter({
        mount: "/live",
        timeout: 45
    });

bayeux.attach(server);

var sockets = bayeux.getClient();

// TODO: Socket stuff
sockets.subscribe("/*", function () {
    console.log("Socket event", arguments);
});

server.listen(4000, function (err) {
    if (err) { throw err; }
    
    console.log("Express started");
});