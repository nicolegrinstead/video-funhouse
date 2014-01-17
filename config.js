var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');
var resources = require('./config.resources.js');
var package = require('./package.json');
var connect = require('connect');

module.exports = function(app) {
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/templates');
    app.set('layout', 'master');

    app.configure(function() {
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(connect.compress());
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.set("layout extractScripts", true);
        app.use(express.static(__dirname + '/static'), { maxAge: 2592000000 });
        app.use(expressLayouts);
        app.use(app.router);
        app.use('/ffmpeg', express.static(__dirname + '/ffmpeg_build'), { maxAge: 2592000000 });
    });


    var isDevelopment = (process.env.NODE_ENV !== 'production');
    //var port = isDevelopment ? 3001 : 5000;
    var port = process.env.PORT || 5000;

    app.configure('development', function(){
        mongoose.connect("mongodb://secretnko4:sECretp4ssword@dharma.mongohq.com:10056/funhouse_production_back");
        app.set("development", true);
    });

    app.configure('production', function(){
        mongoose.connect("mongodb://secretnko4:sECretp4ssword@dharma.mongohq.com:10056/funhouse_production_back");
        app.set("development", false);
    });

    app.set('jsFiles', resources.jsFiles);
    app.set('cssFiles', resources.cssFiles);
    app.set('isDevelopment', isDevelopment);
    app.set('version', package.version);

    return {
        isDevelopment: isDevelopment,
        port: port
    };
};

