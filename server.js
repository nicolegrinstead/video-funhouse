var express = require('express');
var mongoose = require('mongoose');
// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
//require('nko')('B6wfVov2wbP6lTqT');

var app = express();
var config = require('./config.js')(app);
var routes = require('./routes')(app);

// if run as root, downgrade to the owner of this file
if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
        if (err) {
            return console.error(err);
        }

        process.setuid(stats.uid);
    });
}

app.listen(config.port);
console.log("Server listening on port " + config.port);
