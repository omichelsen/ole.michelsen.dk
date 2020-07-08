const https = require('https')

const api = 'https://validator.nu/?level=error&out=json&doc='

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
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
        res.on('end', () => resolve(JSON.parse(raw)))
      })
      .on('error', (err) => reject(err))
  })

exports.handler = (event, context, callback) => {
  const url = `${api}${event.queryStringParameters.url}`

  fetchJson(url)
    .then((data) => {
      const response = {
        valid: data.messages.length ? 'Failed' : 'Passed',
        error: `${data.messages.length} error(s)`,
        report: url.replace('&out=json', ''),
      }

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
