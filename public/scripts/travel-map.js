function initialize() {
    var opt = {
        zoom: 2,
        center: new google.maps.LatLng(40.416698, -3.700354),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var elmMap = document.getElementById('map-canvas');
    var mapOffset = elmMap.offsetTop - 5;
    var map = new google.maps.Map(elmMap, opt);

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
    var markerStyle = {
        url: '/images/mapmarker.png',
        width: 20,
        height: 20,
        opt_textSize: 9
    };
    var locationsArr = Object.keys(locations).map(function (value) {
        return locations[value];
    });
    var mc = new MarkerClusterer(map, locationsArr, {
        gridSize: 20,
        maxZoom: 4,
        styles: [markerStyle, markerStyle]
    });
    var msnry = new Masonry('.images', {
        itemSelector: 'img',
        columnWidth: 106,
        resizable: false
    });

    function scrollTo(element, to, duration) {
        if (duration < 0) return;
        var difference = to - element.scrollTop;
        var perTick = difference / duration * 10;

        setTimeout(function() {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) return;
            scrollTo(element, to, duration - 10);
        }, 10);
    }

    function imageClickHandler(event) {
        event.preventDefault();

        // Cancel any active animations
        if (marker) marker.setAnimation(null);

        // Activate new pin
        var filename = decodeURIComponent(this.src.substring(this.src.lastIndexOf('/') + 1));
        marker = locations[filename];
        marker.setAnimation(google.maps.Animation.BOUNCE);
        map.panTo(marker.getPosition());

        // Set zoom level
        if (map.getZoom() < 5 || map.getZoom() > 15)
            map.setZoom(5);

        scrollTo(document.body, mapOffset, 1000);
    }

    var elmImages = document.querySelectorAll('.images img');
    for (var i = 0; i < elmImages.length; i++) {
        elmImages[i].addEventListener('click', imageClickHandler, false);
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
