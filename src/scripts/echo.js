const echoStore = []

/**
 * Has the element been scrolled into view?
 */
const scrolledIntoView = (element) => {
  const coords = element.getBoundingClientRect()
  return (
    (coords.top >= 0 && coords.left >= 0 && coords.top) <=
    (window.innerHeight || document.documentElement.clientHeight)
  )
}

/**
 * Map image src from data-echo.
 */
const echoSrc = (img) => {
  img.src = img.getAttribute('data-echo')
}

/**
 * Add echo image to store.
 */
const addEcho = (elm) => {
  echoStore.push(elm)
}

/**
 * Remove loaded item from store.
 */
const removeEcho = (elm, i) => {
  if (echoStore.indexOf(elm) !== -1) {
    echoStore.splice(i, 1)
  }
}

/**
 * Echo the images and callbacks on page load.
 */
const echoImages = (...args) => {
  for (let i = 0; i < echoStore.length; i++) {
    const elm = echoStore[i]
    if (scrolledIntoView(elm)) {
      echoSrc(elm)
      removeEcho(elm, i)
      i-- // Since we splice in removeEcho we need to reset i one back or some images will be skipped
    }
  }
}

/**
 * Init
 */
document.querySelectorAll('img[data-echo]').forEach(addEcho)
document.addEventListener('DOMContentLoaded', echoImages, false)
document.addEventListener('scroll', echoImages, false)
document.addEventListener('layout', echoImages, false) // triggered from travel-map.js
