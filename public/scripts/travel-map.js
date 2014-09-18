function initialize() {
    var locations = <?= json_encode($jsArr) ?> ;

    var opt = {
        zoom: 2,
        center: new google.maps.LatLng(40.416698, -3.700354),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), opt);

    var marker, i, pos;
    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][0], locations[i][1]),
            map: map
        });
        // Overwrite coords array with Marker object instead (reduce mem)
        locations[i] = marker;
    }

    // Cluster adjacent markers depending on zoom level
    var markerStyle = {url:'/images/mapmarker.png',width:20,height:20,opt_textSize:9};
    var mc = new MarkerClusterer(map, locations, { gridSize: 20, maxZoom: 4, styles: [markerStyle,markerStyle] });

    var canvasOffset = $('#map_canvas').offset().top - 5;


    $('#thumbs').masonry({
        itemSelector: 'img',
        columnWidth: 106,
        resizable: false
    })
        .children('img').click(function () {
            // Cancel any active animations
            if (marker) marker.setAnimation(null);

            // Activate new pin
            marker = locations[$(this).attr('alt')];
            marker.setAnimation(google.maps.Animation.BOUNCE);
            map.panTo(marker.getPosition());

            // Set zoom level
            if (map.getZoom() < 5 || map.getZoom() > 15)
                map.setZoom(5);

            $('html,body').animate({
                scrollTop: canvasOffset
            }, 1000);

            return false;
        });
}
