const CleanCSS = require('clean-css')
const UglifyJS = require('uglify-es')

exports.handler = (event, context, callback) => {
  if (!event.httpMethod === 'post' || !event.body) {
    return callback(null, { statusCode: 406 })
  }

  const body = JSON.parse(event.body)

  let result

  try {
    if (body.js) {
      result = UglifyJS.minify(body.js)
    } else if (body.css) {
      const output = new CleanCSS().minify(body.css)
      result = {
        error: output.errors[0],
        code: output.styles,
      }
    }
  } catch (error) {
    result = { error }
  }

  if (result.error) {
    callback(result.error)
  } else {
    callback(null, {
      statusCode: 200,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; chartset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ output: result.code }),
    })
  }
}
