define(function(require) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator.getUserMedia
    navigator.getMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

    var mediaConstraints = {
        audio: true,
        video: true
    };

    var initializeWebcam = function(videoElement) {
        return navigator.getMedia(mediaConstraints, function(stream) {
            window.URL = window.URL || window.webkitURL;
            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.play();
        });
    };

    var recorder = function(videoElement) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = videoElement.width;
        canvas.height = videoElement.height;

        this.start = function(fps) {
            this.frames = [];
            var delay = Math.ceil(1000 / fps);
            this.interval = setInterval(function() {
                context.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
                this.frames.push(canvas.toDataURL());
            }.bind(this), delay)
        };

        this.stop = function() {
            clearInterval(this.interval);
            return this.frames;
        };
    };

    return {
        init: initializeWebcam,
        recorder: recorder
    };
});
