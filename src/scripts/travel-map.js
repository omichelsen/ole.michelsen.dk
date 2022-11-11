// https://developers.google.com/maps/documentation/javascript/marker-clustering

function initialize() {
  const opt = {
    zoom: 2,
    center: new google.maps.LatLng(40.416698, -3.700354),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{ stylers: [{ saturation: -100 }] }],
  }
  const elmMap = document.getElementById('map-canvas')
  const map = new google.maps.Map(elmMap, opt)

  var marker
  for (var img in locations) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[img].lat, locations[img].lng),
      map: map,
    })
    // Overwrite image obj with Marker object instead
    locations[img] = marker
  }

  // Cluster adjacent markers depending on zoom level
  var markerStyle = {
    url: '/images/mapmarker.svg',
    width: 20,
    height: 20,
    opt_textSize: 9,
  }
  var markers = Object.keys(locations).map((l) => locations[l])
  
  new markerClusterer.MarkerClusterer({
    map, 
    markers, 
    gridSize: 20,
    maxZoom: 4,
    styles: [markerStyle, markerStyle],
  })

  function scrollTo(element, to, duration) {
    if (duration < 0) return
    var difference = to - element.scrollTop
    var perTick = (difference / duration) * 10

    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick
      if (element.scrollTop === to) return
      scrollTo(element, to, duration - 10)
    }, 10)
  }

  function imageClickHandler(event) {
    event.preventDefault()

    // Cancel any active animations
    if (marker) marker.setAnimation(null)

    // Activate new pin
    var path = this.dataset.echo
    var filename = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1)).replace('webp', 'jpg')
    marker = locations[filename]
    marker.setAnimation(google.maps.Animation.BOUNCE)
    map.panTo(marker.getPosition())

    // Set zoom level
    if (map.getZoom() < 5 || map.getZoom() > 15) map.setZoom(5)

    scrollTo(
      document.documentElement.scrollTo
        ? document.documentElement
        : document.body,
      elmMap.offsetTop - 3,
      1000
    )
  }

  const elmImages = document.querySelectorAll('.images .image-fixed')
  for (let i = 0; i < elmImages.length; i++) {
    elmImages[i].addEventListener('click', imageClickHandler, false)
  }
}

window.addEventListener('load', initialize)

// Init Masonry
const msnry = new Masonry('.images', {
  itemSelector: '.image-fixed',
  columnWidth: 106,
  resizable: false,
  fitWidth: true,
})
