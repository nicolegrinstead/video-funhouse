(function() {
    $(document).on('click', '.video a.post, .video button', function(e){
        console.log("clicked");
        var id = $(this).data('id');
        var url = $(this).data('url');
        $.post(url+id);
        return false;
    });

})();