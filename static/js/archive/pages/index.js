define(function(require) {
    var webcam = require('plugin/webcam');
    var video = $('video')[0];
    webcam.init(video);

    var recorder = new webcam.recorder(video);
    var fps = 60;

    $('#record').click(function() {
        recorder.start(fps);
    });

    $('#stop').click(function() {
        var frames = recorder.stop();
        console.log(frames);
    })

    $('#save').click(function() {
        var video2 = window.video2;
        var req = new XMLHttpRequest();
        req.open("POST", '/save', true);
        req.onload = function () {};
        var blob = dataURLToBlob(video2);
        req.send(blob);
    });


    /**
    * Creates and returns a blob from a data URL (either base64 encoded or not).
    *
    * @param {string} dataURL The data URL to convert.
    * @return {Blob} A blob representing the array buffer data.
    */
    function dataURLToBlob(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
});