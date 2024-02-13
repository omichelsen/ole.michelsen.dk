// https://developers.google.com/maps/documentation/javascript/marker-clustering
// https://developers.google.com/maps/documentation/javascript/events

function initialize() {
  const opt = {
    zoom: 2,
    center: new google.maps.LatLng(40.416698, -3.700354),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{ stylers: [{ saturation: -100 }] }],
  }
  const elmMap = document.getElementById('map-canvas')
  const map = new google.maps.Map(elmMap, opt)

  let marker
  for (let img in locations) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[img].lat, locations[img].lng),
      map: map,
    })
    marker.id = img.replace('.jpg', '')
    // Overwrite image obj with Marker object instead
    locations[img] = marker
  }

  const markers = Object.keys(locations).map((l) => locations[l])

  new markerClusterer.MarkerClusterer({
    map,
    markers,
    renderer: {
      render: function ({ count, position }) {
        const svg = window.btoa(`
  <svg fill="red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <circle cx="120" cy="120" opacity=".8" r="70" />
  </svg>`)
        return new google.maps.Marker({
          position,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
            scaledSize: new google.maps.Size(55, 55),
          },
          label: {
            text: String(count),
            color: 'rgba(255,255,255,0.9)',
            fontSize: '12px',
          },
          // adjust zIndex to be above other markers
          zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
        })
      },
    },
  })

  function scrollTo(element, to, duration) {
    if (duration < 0) return
    const difference = to - element.scrollTop
    const perTick = (difference / duration) * 10

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
    const path = this.dataset.echo
    const filename = decodeURIComponent(
      path.substring(path.lastIndexOf('/') + 1)
    ).replace('webp', 'jpg')
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

  // filter images based on map zoom
  google.maps.event.addListener(map, 'idle', function () {
    const bounds = map.getBounds()
    for (const img of Object.values(locations)) {
      const elmImg = document.querySelector(`[alt="${img.id}"]`)
      const isVisible = bounds.contains(img.getPosition())
      elmImg.style.display = isVisible ? 'block' : 'none'
    }
    msnry.layout()
    setTimeout(
      () => document.dispatchEvent(new Event('layout')), // triggers echo.js
      200
    )
  })

  map.setZoom(4)
  const animate = () => {
    setTimeout(() => map.panTo({ lat: 35.647,	lng: -120.6701, }), 2000) // paso
    setTimeout(() => map.panTo({ lat: 21.033, lng: 105.8538, }), 4000) // viet
    setTimeout(() => map.panTo({ lat: 49.0081, lng: 8.4038, }), 6000) // kar
  }
  animate()
  setInterval(animate, 8000)

}

window.addEventListener('load', initialize)

// Init Masonry
const msnry = new Masonry('.images', {
  itemSelector: '.image-fixed',
  columnWidth: 106,
  resizable: false,
  fitWidth: true,
})
