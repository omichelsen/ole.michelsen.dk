const http = require('http')
const https = require('https')

const protocol = (url) => (url.startsWith('https') ? https : http)

const fetchRaw = (url) =>
  new Promise((resolve, reject) => {
    protocol(url)
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          return reject(
            new Error(
              `fetch statusCode=${res.statusCode} statusMessage=${res.statusMessage}`
            )
          )
        }

        let raw = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (raw += chunk))
        res.on('end', () => resolve(raw))
      })
      .on('error', (err) => reject(err))
  })

const parseUrlsFromXml = (xml) =>
  [...xml.matchAll(/<loc>(.+?)<\/loc>/gi)].map(([, g1]) => g1)

const parseUrlsFromTxt = (txt) =>
  [...txt.matchAll(/(https?:\/\/.+?)$/gim)].map(([, g1]) => g1)

exports.handler = (event, context, callback) => {
  const url = event.queryStringParameters.url

  fetchRaw(url)
    .then((data) => {
      const response = data.includes('<?xml')
        ? parseUrlsFromXml(data)
        : parseUrlsFromTxt(data)

      callback(null, {
        statusCode: 200,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; chartset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(response),
      })
    })
    .catch((err) => {
      console.error(err.message)
      callback(err)
    })
}
