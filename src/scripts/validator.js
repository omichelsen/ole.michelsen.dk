const apiSitemap = '/.netlify/functions/validator-sitemap'
const apiValidator = '/.netlify/functions/validator-proxy'

const delay = 3000
const requestLimit = 100000

let activeTimers = 0
let timerIntervalId = 0

const imgLoading = '<img src="/images/loading.gif" height="11" width="16">'

const getJson = (url) =>
  fetch(url).then((res) => (res.ok ? res.json() : undefined))

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#validator').addEventListener('submit', (event) => {
    event.preventDefault()

    document.querySelector('input[type=submit]').disabled = true

    document.querySelector(
      '#results'
    ).innerHTML = `<tr><td class="c" colspan="3">Processing sitemap...<br>${imgLoading}</td></tr>`

    const url = document.querySelector('#sitemapuri').value
    getJson(`${apiSitemap}?url=${encodeURIComponent(url)}`).then(
      handleSitemapResponse
    )
  })
})

function handleSitemapResponse(data = []) {
  if (!data.length) {
    // No data was returned, so display error message and reenable submit for retry
    document.querySelector('#results td:first-child').innerHTML =
      '<span style="color:#B00">Sitemap could not be parsed - wrong URI?</span>'
    document.querySelector('input[type=submit]').disabled = false
    return
  }

  let out = ''

  data.forEach((value, index) => {
    out += `<tr><td class="r">${
      index + 1
    }</td><td>${value}</td><td class="c" id="loading${index}">${
      index < requestLimit ? imgLoading : 'Deferred'
    }</td></tr>`

    if (index < requestLimit) {
      // Request the validation service for each uri with specified delay
      setTimeout(validate.bind(this, index, value), delay * index)

      // We have added a new timer
      activeTimers++
    }
  })

  document.querySelector('#results').innerHTML = out
}

function validate(index, uri) {
  getJson(`${apiValidator}?url=${encodeURIComponent(uri)}`).then((data) => {
    document.querySelector(`#loading${index}`).innerHTML = `<a href="${
      data.report
    }" target="_blank" rel="noopener noreferrer" style="color:${
      data.valid == 'Passed' ? '#006400' : '#B00'
    }">${data.valid || data.error}</a>`

    // Update timer count and check for remaining
    activeTimers--
    checkTimers()
  })
}

function checkTimers() {
  if (activeTimers < 1) {
    document.querySelector('input[type=submit]').disabled = false
    clearInterval(timerIntervalId)
  }
}
