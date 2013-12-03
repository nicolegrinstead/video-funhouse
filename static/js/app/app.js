var worker;
var screenShotWorker;
var consoleElement;
var stagingContainer;
var outputElement;
var running = false;
var ready = false;
var lastFileData;
var lastFileName;
window.URL = window.URL || window.webkitURL;

var isMobile = (function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
})();

var isSupported = (function() {
  return window.URL && window.Worker && FileReaderJS.enabled && !isMobile;
})();

function showLoader() {
  $("#loader").show();
}
function hideLoader() {
  $("#loader").hide();
}

function markReady() {
  ready = true;
  //console.log("HERE", $("#app-container"));
  $("#app-container").addClass("ready");
}
function startRunning() {
  running = true;
  $("#output-stuff").show();
  $("#welcome-message").hide();
  $(outputElement).empty();
}
function stopRunning() {
  running = false;
  $("#welcome-message").show();
}
function workerReady() {
  if (worker && screenShotWorker) {
    markReady();
    hideLoader();
  }
}
function initScreenshotWorker() {
  screenShotWorker = new Worker("/js/app/screenshot-worker.js");
  screenShotWorker.onmessage = function (event) {
    var message = event.data;
    if (message.type == "ready") {
      workerReady();
    } else if (message.type == "screenshotsdone") {
      //console.log(message);
      var buffers = message.data;
      if (buffers) {
        for (var i = 0; i < buffers.length; i++) {
          $("#output-screenshots").append(getImage(buffers[i]));
        }
      }
    }
  }

}
function initWorker() {
  worker = screenShotWorker = new Worker("/js/app/worker.js");
  worker.onmessage = function (event) {
    var message = event.data;
    if (message.type == "stdout") {
      consoleElement.textContent += message.data + "\r\n";
      //console.log("STOOUT", message);
    } else if (message.type == "start") {
      //console.log("START", message);
      consoleElement.textContent += "Worker has received command\r\n";
      showLoader();
    }
    else if (message.type == "probedone") {
      var meta = message.meta;

      var buffer = message.data;
      if (buffer) {
        outputElement.appendChild(getImage(buffer));
      }

      var duration = meta.match(/Duration: (.[^,]*)[,\n]/);
      if (duration) {
        duration = duration[1];
      }
      var codec = meta.match(/Video: (.[^,]*)[,\n]/);
      if (codec) {
        codec = codec[1];
      }
      var bitrate = meta.match(/bitrate: (.[^,]*)[,\n]/);
      if (bitrate) {
        bitrate = bitrate[1];
      }
      var resolution = meta.match(/Video: .[^,]*, .[^,]*, (.[^,]*)/);
      var width, height;
      if (resolution) {
        resolution = resolution[1];
      }

      $(document).trigger('probedone', {
        data: message.data,
        duration: duration,
        codec: codec,
        bitrate: bitrate,
        resolution: resolution
      });

      $("#metadata-container .loader").hide();
      var metaDataConsole = $("#metadata-container .console")[0];
      metaDataConsole.textContent = [
        "Duration: " + duration,
        "Codec: " + codec,
        "Bitrate: " + bitrate,
        "Resolution: " + resolution,
        "Total Time Processing (internal): " + message.elapsed
      ].join("\n");
    } else if (message.type == "done") {
      //console.log("DONE", message);
      stopRunning();
      var buffer = message.data;
      if (buffer) {
        outputElement.appendChild(getDownloadLink(buffer, message.fileName));
      }
      hideLoader();
    } else if (message.type == "ready") {
      workerReady();
    }
  };
}

if (isSupported) {
  initWorker();
  // initScreenshotWorker();
}

function setupFakeForm() {
  var form = $("#fake-form");
  form.on("click", "li", function() {
    $(this).toggleClass("active");
  });

  form.on("click", "button", function() {
    var inputs = $("#scales input");
    var isDisabled = inputs.is(":disabled");
    if (isDisabled) {
      inputs.removeAttr("disabled");
    }
    else {
      inputs.attr("disabled", "");
    }
  })
}

function faceToGifBlobListener(blob) {

  console.log("HERE!!", blob);
  var arrayBuffer;
  var fileReader = new FileReader();
  fileReader.onload = function() {
    arrayBuffer = this.result;
    var byteArray = new Uint8Array(arrayBuffer);
    queueFile("input.gif", byteArray);
  };
  fileReader.readAsArrayBuffer(blob);
  $(".facetogif").hide();
}
function serializeFakeForm() {

  var form = $("#fake-form");
  var filters = form.find("[data-filter]").filter(function() {
    return $(this).is(":checked");
  }).map(function() {
    return $(this).data("filter");
  }).toArray();
  filters.push("showinfo");

  var scales = $("#scales input");
  if (!scales.is(":disabled")) {
    var w = scales[0].value;
    var h = scales[1].value;

    if (window.current_resolution) {
      filters.push("scale=w=" + w + ":h=" + h);
    }
    else {
      if (w !== "-1") {
        w = "iw*100/" + w;
      }
      if (h !== "-1") {
        h = "ih*100/" + h;
      }

      filters.push("scale=w=" + w + ":h=" + h);
    }
  }
  // var caption = serialized.filter(function(f) { return f.name === "caption"; });
  // if (caption.length) {
  //   //drawtext="fontfile=/usr/share/fonts/truetype/ttf-dejavu/DejaVuSerif.ttf:text='Text to write':fontsize=20:fontcolor=black:x=100:y=100"
  //   var textFilter = "drawtext=text=" + caption[0].value;
  //   filters.push({
  //     value: textFilter
  //   });
  // }
  //
  var times = [];
  var start = [];

  if (typeof(window.slidermin) !== 'undefined' && typeof(window.slidermax) !== 'undefined') {
    times.push(window.slidermax - window.slidermin);
    start.push(window.slidermin);
  }

  var formats = form.find("[data-format]").filter(function() {
    return $(this).parent().is(".active");
  }).map(function() {
    return $(this).data("format");
  }).toArray();
  console.log("HERE", formats);
  if (!formats.length) {
    formats.push("gif");
  }

  return {
    filters: filters,
    formats: formats,
    times: times,
    start: start
  }
}
function getModule() {
  return {
    print: function (text) {
      consoleElement.textContent += text + "\r\n";
      //console.log("stdout:", text);
    },
    printErr: function (text) {
      consoleElement.textContent += text + "\r\n";
      //console.log("stderr:", text);
    }
  };
}

function processSampleVideo() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "/video/bigbuckbunny.webm", true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if (arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer);
      queueFile("bigbuckbunny.webm", byteArray);
    }
  };

  oReq.send(null);
}

function sendBuffer(url, buffer, sucess) {


}

function processSampleImage() {
  var data;
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext('2d');
  var img = document.createElement("img");
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    data = dataURItoArrayBuffer(canvas.toDataURL("image/jpeg"));
    queueFile("moz.jpg", data);
  }
  img.src = "/img/moz.jpg";
}

// http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURItoArrayBuffer(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return ia;
}

function cleanName (name) {
    name = name || "sample-file";
    name = name.replace(/\s+/gi, '-'); // Replace white space with dash
    return name.replace(/[^a-zA-Z0-9\-\.]/gi, ''); // Strip any special charactere
}


function queueFile(fileName, fileData, defaultArgs) {
  if (running) {
    // alert("Please wait for the last video to finish processing before starting this one.");
    return;
  }
  lastFileData = fileData;
  lastFileName = fileName;
  startRunning();
  var probing = true;
  resetContent();
  $(".sidebar .overlay").show();
  var go = document.getElementById("go");
  var commandInput = $("#staging-command");
  var commandPreview = $("#staging-command-preview");
  go.textContent = "Start processing";
  go.onclick = function () {
    dequeueFile(commandInput.val());
  }

  fileName = cleanName(fileName);

  $("#staging-container .cancel").on("click", function() {
    cancel();
  });
  var form = $("#fake-form");
  form.on("change click mousedown mouseup slidechange", function() {
    setTimeout(function() {
      printOptionsToInput();
    }, 10);
  });
  printOptionsToInput();
  function printOptionsToInput() {
    var options = getOptions();
    commandInput.val(options).trigger("change");
  }
  function getOptions() {
    var ret = "";

    var serialized = serializeFakeForm();
    console.log("SERIALIZED", serialized);

    // Time and start should go first in argument ordering IIRC
    // var time = serialized.filter(function(f) { return f.name === "time"; })
    if (serialized.times.length) {
      ret += "-t " + serialized.times[0] + " ";
    }

    if (serialized.start.length) {
      ret += "-ss " + serialized.start[0] + " ";
    }

    if (!serialized.times.length && !serialized.start.length) {
      ret += "-t 5 ";
    }

    ret += "-i " + fileName;

    if (serialized.filters.length) {
      ret += " -vf " + serialized.filters.join(",");
    }

    var format = serialized.formats[0];

    ret += " -strict experimental";
    ret += " -v verbose";
    ret += " output." + format;

    return ret;
  }

  stagingContainer.style.display = "block";
  form.show();

  function cancel() {
    $("#staging-container .cancel").off("click");
    form.off("change");
    stagingContainer.style.display = "none";
    $(".sidebar .overlay").show();
    Module = args = go = fileData = null;
  }

  function dequeueFile(commandArguments) {
    //console.log(commandArguments);

    var argumentsArray = commandArguments.split(" ");
    var outputFileName = argumentsArray[argumentsArray.length - 1];
    var Module = getModule();
    Module.fileData = fileData;
    Module.fileName = fileName;
    Module['arguments'] = argumentsArray;

    ffmpeg(Module);

    cancel();
  }

  var metaDataConsole = $("#metadata-container .console")[0];
  metaDataConsole.textContent = "Fetching metadata, please wait";
  worker.postMessage({
    'type': 'probe',
    fileData: fileData,
    fileName: fileName
  });

  // screenShotWorker.postMessage({
  //   'type': 'screenshots',
  //   fileData: fileData,
  //   fileName: fileName
  // });

  probing = false;

}

function getImage(fileData) {
  var blob = new Blob([fileData]);
  var src = window.URL.createObjectURL(blob);
  var img = document.createElement('img');

  img.src = src;
  return img;
}

function getDownloadLink(fileData, fileName) {
  var url = window.webkitURL || window.URL || window.mozURL || window.msURL;
  var a = document.createElement('a');
  a.download = fileName || 'output.mpeg';
  var blob = new Blob([fileData]);
  var src = window.URL.createObjectURL(blob);
  a.href = src;
  a.textContent = 'Click here to download ' + fileName + "!";

  var container = document.createElement('div');

  var saveLink;
  if (fileName.indexOf('gif') !== -1) {
    saveLink = $("<button>Send to server</button>");
    saveLink.click(function() {
      if(saveLink.is(':disabled')){
        return;
      }
      saveLink.attr('disabled',true);
      saveLink.text('Sending');
      Utility.sendBlob('/save', blob, function(xhr) {
        var resp = xhr.target.responseText;
        $(container).append('<a href="/view/' + resp + '">View Your Video</a>');
        saveLink.remove();

      });
    });
    $(container).append(getImage(fileData));
    $(container).append("<br />");
  }

  $(container).append(a);
  $(container).append("  ");
  if (saveLink) {
    $(container).append(saveLink);

  }
  
  var redo = $("<button>Start over with the original</button>");
  redo.on("click", function() {
    queueFile(lastFileName, lastFileData);
  });
  $(container).append(redo);

  return container;
}

function runArbitraryCommand(cmd) {
  if (running) {
    return;
  }
  resetContent();
  var Module = getModule();
  Module['arguments'] = cmd.split(" ");
  ffmpeg(Module);
}

document.addEventListener('DOMContentLoaded', function () {

  if (!worker) {
    $("#not-supported-message").text($("#not-supported").html()).show();
    $("#app").hide();
    return;
  }

  setupFakeForm();

  consoleElement = document.getElementById("console");
  stagingContainer = document.getElementById("staging-container");
  outputElement = document.getElementById("output");

  
  document.getElementById("process-sample-webcam").addEventListener("click", function() {
    $(".facetogif").appendTo("#welcome-message").show();
    $("#put-your-face-here").click();
  }, false);
  document.getElementById("process-sample-image").addEventListener("click", function() {
    processSampleImage();
  }, false);
  document.getElementById("process-sample-video").addEventListener("click", function() {
    processSampleVideo();
    this.textContent = "Loading video..."
  }, false);

  var commandInput = document.getElementById("command");
  var runCommand = document.getElementById("runcommand");
  if (runCommand && commandInput) {
  runCommand.addEventListener("click", function () {
    commandInput.setAttribute("disabled", "disabled");
    runArbitraryCommand(document.getElementById("command").value);
    commandInput.removeAttribute("disabled");
  }, false);

  commandInput.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      commandInput.setAttribute("disabled", "disabled");
      runArbitraryCommand(document.getElementById("command").value);
      commandInput.removeAttribute("disabled");
    }
  }, false);
  }

  $("#staging-command").on("change", function() {
    $("#staging-command-preview").text($(this).val());
  });

  $("#staging-command-toggle").on("click", function() {
    $("#staging-command-preview").toggle();
    $("#staging-command").toggle();
    return false;
  });

  var filereaderOpts = {
    readAsDefault: "ArrayBuffer",
    readAsMap: {

    },
    on: {
      load: function (e, file) {
        var arrayBuffer = e.target.result;
        var data = new Uint8Array(arrayBuffer);
        var defaultArgs = undefined;
        if (file.type.indexOf("image") === 0) {
          defaultArgs = "-i " + file.name + " -v debug -an output.mov";
        }
        queueFile(file.name, data, defaultArgs);
      }
    }
  };
  FileReaderJS.setSync( true );
  FileReaderJS.setupDrop(document.body, filereaderOpts);
  FileReaderJS.setupClipboard(document.body, filereaderOpts);
  FileReaderJS.setupInput(document.getElementById("picker"), filereaderOpts);
});

function resetContent() {
  consoleElement.textContent = "";
  $(consoleElement).hide();
}

function ffmpeg(module) {
  console.log("About to begin processing with arguments", module['arguments']);

  startRunning();
  resetContent();
  console.log(consoleElement);
  $(consoleElement).show();
  consoleElement.textContent += "Sending command to worker\r\n";
  worker.postMessage({
    'type': 'file',
    fileData: module.fileData,
    fileName: module.fileName,
    args: module['arguments'],
  });
}