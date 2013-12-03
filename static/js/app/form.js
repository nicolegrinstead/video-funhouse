(function() {

// form elements;
var scalew, scaleh, time, start;

$(function() {
    scalew = $("#scale-width");
    scaleh = $("#scale-height");
    time = $("[name=time]");
    start = $("[name=start]");
    scalew.add(scaleh).on('change', updateres);

    function updateres() {
        $("#resolution-string").text(getResolutionString());
    }

    function getResolutionString() {
        var selectedX = parseInt(scalew.val());
        var selectedY = parseInt(scaleh.val());
        if (window.current_resolution) {
            var totalX = window.current_resolution[0];
            var totalY = window.current_resolution[1];
            if (selectedX === -1 && selectedY === -1) {
                return current_resolution.join('x');
            }

            if (selectedX === -1) {
                selectedX = Math.ceil(current_resolution[0] * (selectedY / current_resolution[1]))
            }
            if (selectedY === -1) {
                selectedY = Math.ceil(current_resolution[1] * (selectedX / current_resolution[0]))
            }

            return selectedX + 'x' + selectedY;
        }

        if (selectedX === -1 && selectedY === -1) {
            return "100%x100%";
        }

        if (selectedX === -1) {
            selectedX = selectedY;
        }
        if (selectedY === -1) {
            selectedY = selectedX;
        }

        return selectedX + "%x" + selectedY + "%";
    }
});

$(document).on("probedone", function(ev, data) {
    // [0] = x, [1] = y
    if (data.resolution && data.resolution.indexOf('x') !== -1) {
        var resolution = data.resolution.split('x').map(function(i) {
            return parseInt(i);
        });
        
        window.current_resolution = resolution;
        scaleh.attr("max", parseInt(resolution[1]))
        scalew.attr("max", parseInt(resolution[0]));
        $("#resolution-string").text(resolution[0] + 'x' + resolution[1]);
    }
    else {
        window.current_resolution = null;
        scalew.attr("max", 100);
        scaleh.attr("max", 100);
    }

    // [0] = h, [1] = m, [2] = s
    data.duration = data.duration || "0:0:0";
    var length = data.duration.split(':').map(function(i) {
        return parseInt(i);
    });

    $("#slider-label").text('0 - 5');
    var secondsLength = (length[0] * 3600) + (length[1] * 60) + length[2];

    $("#time-container").toggle(secondsLength > 0);
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: secondsLength,
        values: [ 0, 15 ],
        slide: function( event, ui ) {
            window.slidermin = ui.values[0];
            window.slidermax = ui.values[1];
            $("#slider-label").text(window.slidermin + ' - ' + window.slidermax);
            $("#fake-form").trigger("slidechange");
        }
    });

  $(".sidebar .overlay").hide();
});

})();