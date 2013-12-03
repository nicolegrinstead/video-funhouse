importScripts('../../ffmpeg/ffmpeg.js?v=0.0.1');

var now = Date.now;

// http://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return hrs + ':' + mins + ':' + secs + '.' + ms;
}

onmessage = function(event) {

  var message = event.data;

  if (message.type === "screenshots") {

    var postedData = [];
    var module = {
      fileData: message.fileData,
      fileName: message.fileName,
      arguments: ["-i", message.fileName, "-vf", "thumbnail,scale=-1:100", "-frames:v", "1", "output/thumb.jpeg"],
      // arguments: ["-t", "10", "-i", message.fileName, "-s", "100x100", "-f", "image2", "-vf", "fps=fps=1", "output/out%d.jpeg"],
      print: function (text) {
        postedData.push(text);
      },
      printErr: function (text) {
        postedData.push(text);
      }
    }

    var time = now();
    var result = ffmpeg_run(module);
    var totalTime = now() - time;


    var buffers = [];
    if (result && result.object && result.object.contents) {
      for (var i in result.object.contents) {
        if (result.object.contents.hasOwnProperty(i)) {
          buffers.push(new Uint8Array(result.object.contents[i].contents).buffer);
        }
      }
      // buffer = new Uint8Array(outputFileHandle.contents).buffer;
    }

    postMessage({
      'type' : 'screenshotsdone',
      'data' : 'Finished processing (took ' + msToTime(totalTime) + ')',
      'meta' : postedData.join(""),
      'data' : buffers,
      'elapsed': totalTime
    });
  }
};

postMessage({
  'type' : 'ready'
});
