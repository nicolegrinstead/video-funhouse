var db = require("./models/db.js");
var fs = require('fs');

module.exports = function(app) {
    app.get('/testinguploads', function(req, res) {
        return res.render('index.ejs', {
            title: "NKO4 Project",
            msg: 'hey',
            scripts: [
                '1.js'
            ]
        });
    });

    app.get('/', function(req, res) {
        return res.render('app.ejs', {
            title: "The App"
        });
    });
    app.get('/app', function(req, res) {
        return res.redirect("/");
    });

    app.get('/about', function(req, res) {
        return res.render('about.ejs', {
            title: "About"
        });
    });

    app.post('/save', function(req, res) {
        var contentType = req.headers['content-type'];
        var fileName = req.headers[''];

        var id = db.getId();
        var filePath = __dirname + '/static/user/' + id;
        var bytesUploaded = 0;
        var file = fs.createWriteStream(filePath, {
            flags: 'w',
            encoding: 'binary',
            mode: 0644
        });

        var fileComplete = false;
        var dbComplete = false;

        db.createVideo(fileName, id, contentType, function() {
            dbComplete = true;
            done();
        });

        req.on('data', function(data) {
            file.write(data);
        });

         req.on('end', function(data) {
            file.end();
            fileComplete = true;
            done();
         })

        function done() {
            if (dbComplete && fileComplete) {
                res.send(id);
            }
        }
    });

    app.get('/view/:id', function(req, res) {
        var id = req.params.id;
        db.getVideo(id, function(err, file) {
            if (err || !file) {
                return res.status(404);
            }

            return res.render('view.ejs', {
                title: file.name,
                video: file
            });
        });
    });

    app.post('/upVote/:id', function(req, res) {
        var id = req.params.id;
        db.upVote(id);
        res.end();
    });

    app.post('/downVote/:id', function(req, res) {
        var id = req.params.id;
        db.downVote(id);
        res.end();
    });

    app.get('/superSecretDelete/:id', function(req, res) {
        var id = req.params.id;
        db.superSecretDelete(id);
        res.end();
    });

    app.get('/superSecretUpvote/:id', function(req, res) {
        var id = req.params.id;
        db.superSecretUpvote(id);
        res.end();
    });

    app.get('/superSecretDownvote/:id', function(req, res) {
        var id = req.params.id;
        db.superSecretDownvote(id);
        res.end();
    });

    app.get('/gallery/:sortorder', function(req, res) {
        var sortorder = req.params.sortorder;
        if (sortorder === 'recent'){ 
            db.getRecentVideos(function(err, videos) {
                if (err || !videos) {
                    res.send("Not found", 404);
                    return;
                }     

                res.render("gallery.ejs", { title: "Gallery", videos: videos });
            });
        } else { 
            db.getTopVideos(function(err, videos) {
                if (err || !videos) {
                    res.send("Not found", 404);
                    return;
                }     

                res.render("gallery.ejs", { title: "Gallery", videos: videos });
            });
        }
    });

    app.get('/test', function(req, res) {
        db.createVideo("testname", "test route");

        var video = db.getVideo("testname", function(err, file) {
            if (err || !file) {
                res.send("Not found", 404);
                return;
            }

            res.send(file);
        });
        
        return res.render('app.ejs', {
            title: "NKO4 Project",
            msg: 'testing'
        });
    });
};