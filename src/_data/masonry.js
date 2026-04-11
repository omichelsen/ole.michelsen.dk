import Fetch from '@11ty/eleventy-fetch'
import { minify } from 'terser'

const MASONRY_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/masonry/4.1.0/masonry.pkgd.min.js'

export default async function () {
  const source = await Fetch(MASONRY_URL, {
    duration: '1y',
    type: 'text',
  })
  const text = Buffer.isBuffer(source) ? source.toString('utf8') : source

  const result = await minify(text, {
    compress: true,
    mangle: true,
    format: {
      comments: false,
    },
  })

  return result.code
}
