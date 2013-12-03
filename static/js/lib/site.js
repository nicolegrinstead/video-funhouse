(function() {
    $(document).on('click', '.video a.post, .video button', function(e){
        console.log("clicked");
        var id = $(this).data('id');
        var url = $(this).data('url');
        $.post(url+id);
        return false;
    });

    setTimeout(function() {
    $("#frame-container").append('<iframe src="http://nodeknockout.com/iframe/devcomo" frameborder=0 scrolling=no allowtransparency=true width=115 height=25></iframe>');
    }, 1000);

})();