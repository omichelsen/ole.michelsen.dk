function initialize() {
    var opt = {
        zoom: 2,
        center: new google.maps.LatLng(40.416698, -3.700354),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), opt);

    var marker, pos;
    for (var img in locations) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[img].lat, locations[img].lng),
            map: map
        });
        // Overwrite image obj with Marker object instead
        locations[img] = marker;
    }

    // Cluster adjacent markers depending on zoom level
    var markerStyle = {url:'/images/mapmarker.png',width:20,height:20,opt_textSize:9};
    var locationsArr = $.map(locations, function (value) {
        return value;
    });
    var mc = new MarkerClusterer(map, locationsArr, { gridSize: 20, maxZoom: 4, styles: [markerStyle,markerStyle] });

    var canvasOffset = $('#map_canvas').offset().top - 5;


    $('.thumbs').masonry({
        itemSelector: 'img',
        columnWidth: 106,
        resizable: false
    })
        .children('img').click(function () {
            // Cancel any active animations
            if (marker) marker.setAnimation(null);

            // Activate new pin
            var filename = decodeURIComponent($(this).attr('src').substring($(this).attr('src').lastIndexOf('/') + 1));
            marker = locations[filename];
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

google.maps.event.addDomListener(window, 'load', initialize);
