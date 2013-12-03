importScripts('../../ffmpeg/ffmpeg.js?v=0.0.1');

var now = Date.now;

function getModule() {
  return {
    print: function (text) {
      postMessage({
        'type' : 'stdout',
        'data' : text
      });
    },
    printErr: function (text) {
      postMessage({
        'type' : 'stdout',
        'data' : text
      });
    }
  };
}

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

  if (message.type === "probe") {
    var postedData = [];
    var module = {
      fileData: message.fileData,
      fileName: message.fileName,
      arguments: ["-t", "1", "-i", message.fileName], //, "-vf", "thumbnail,scale=640:360", "-frames:v", "1", "output/thumb.jpeg"],
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

    // Not taking screenshot here for now, to make returning metadata faster
    var outputFileHandle = result && result.object.contents["thumb.jpeg"];
    var buffer;

    if (outputFileHandle) {
      buffer = new Uint8Array(outputFileHandle.contents).buffer;
    }

    postMessage({
      'type' : 'probedone',
      'data' : 'Finished processing (took ' + msToTime(totalTime) + ')',
      'meta' : postedData.join(""),
      'data' : buffer,
      'elapsed': totalTime
    });
  }

  if (message.type === "file") {

    postMessage({
      'type' : 'start',
    });
    if (message.fileData) {
      postMessage({
        'type' : 'stdout',
        'data' : 'Received file.  Length: ' + message.fileData.length
      });
    } else {
      postMessage({
        'type' : 'stdout',
        'data' : 'Received command (no file).'
      });
    }

    var outputFilePath = message.args[message.args.length - 1];
    if (message.args.length > 2 && outputFilePath && outputFilePath.indexOf(".") > -1) {
      message.args[message.args.length - 1] = "output/" + outputFilePath;
    }

    var Module = getModule();
    Module.fileData = message.fileData;
    Module.fileName = message.fileName;
    Module['arguments'] = message.args;

    var time = now();
    postMessage({
      'type' : 'stdout',
      'data' : 'Received command: ' + message.args.join(" ")
    });

    var result = ffmpeg_run(Module);

    var totalTime = now() - time;
    postMessage({
      'type' : 'stdout',
      'data' : 'Finished processing (took ' + msToTime(totalTime) + ')'
    });

    var outputFileHandle = result && result.object.contents[outputFilePath];
    var buffer;

    if (outputFileHandle) {
      buffer = new Uint8Array(outputFileHandle.contents).buffer;
    }

    postMessage({
      'type' : 'done',
      'data' : buffer,
      'fileName' : outputFilePath
    });
  }
};

postMessage({
  'type' : 'ready'
});
