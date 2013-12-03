var mongoose = require('mongoose');
var _ = require("underscore");

var MONGOHQ_URL= "mongodb://secretnko4:sECretp4ssword@widmore.mongohq.com:10000/funhouse";

var videoSchema = new mongoose.Schema({
    name: String,
    path: String, 
    contentType: String,
    score: Number,
    id: String,
    createDate: Date
});

var Video = mongoose.model("Video", videoSchema);

Video.prototype.getUrl = function() {
    return '/user/' + this.id;
};

function makeid(length) {
    length = length || 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function createVideo(name, id, contentType, callback) {
    mongoose.createConnection(MONGOHQ_URL);
    var video = new Video({
        name: name,
        score: 0,
        id: id,
        contentType: contentType, 
        createDate: new Date()
    });

    video.save(function(err, img) {
        if (err) {
            console.log("failed save");
            return;
        }

        callback(img);
    });
}

function getVideo(id, cb){
    Video.findOne({ id: id }, function(err, doc) {
        cb(err, doc);
    });
}

function getTopVideos(cb){
	var query = Video.find().sort({score:-1}).limit(20);

	query.exec(function(err, doc) {
        cb(err, doc);
    });
}

function getRecentVideos(cb){
	var query = Video.find().sort({createDate:-1}).limit(20);

	query.exec(function(err, doc) {
        cb(err, doc);
    });
}

function upVote(id){ 
    getVideo(id, function(err, video) {
        if (err || !video) {
             return;
        }

        video.score = (video.score || 0)+1;
        video.save();
    });
}

function downVote(id){ 
    getVideo(id, function(err, video) {
        if (err || !video) {
              return;
        }

        video.score = (video.score || 0)-1;
        video.save();
    });
}

function superSecretDelete(id){ 
    getVideo(id, function(err, video) {
        if (err || !video) {
             return;
        }
        video.remove();
    });
}

function superSecretUpvote(id){ 
    getVideo(id, function(err, video) {
        if (err || !video) {
             return;
        }

        video.score = (video.score || 0)+100;
        video.save();
    });
}

function superSecretDownvote(id){ 
    getVideo(id, function(err, video) {
        if (err || !video) {
              return;
        }

        video.score = (video.score || 0)-100;
        video.save();
    });
}
exports.getVideo = getVideo;
exports.createVideo = createVideo;
exports.getId = makeid;
exports.upVote = upVote;
exports.downVote = downVote;
exports.getTopVideos = getTopVideos;
exports.getRecentVideos = getRecentVideos;
exports.superSecretDelete = superSecretDelete;
exports.superSecretUpvote = superSecretUpvote;
exports.superSecretDownvote = superSecretDownvote;