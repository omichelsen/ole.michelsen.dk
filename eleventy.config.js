import ejsPlugin from '@11ty/eleventy-plugin-ejs'
import pugPlugin from '@11ty/eleventy-plugin-pug'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import cacheBuster from '@mightyplow/eleventy-plugin-cache-buster'

export default function (eleventyConfig) {
  eleventyConfig.setQuietMode(true)

  eleventyConfig.addPlugin(cacheBuster({ outputDirectory: 'public' }))
  eleventyConfig.addPlugin(ejsPlugin)
  eleventyConfig.addPlugin(pugPlugin)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy('src/_redirects')
  eleventyConfig.addPassthroughCopy('src/portfolio/mmt/site')
  eleventyConfig.addPassthroughCopy('src/scripts')
  eleventyConfig.addPassthroughCopy('src/viewsource')

  eleventyConfig.addWatchTarget('src/styles/*.css')

  eleventyConfig.addCollection('blogDesc', (collectionApi) =>
    collectionApi
      .getAll()
      .filter(({ data: { tags = [] } }) => tags.includes('blog'))
      .sort((a, b) => {
        const ad = a.data.dateModified || a.data.date
        const bd = b.data.dateModified || b.data.date
        return ad < bd ? -1 : ad > bd ? 1 : 0
      })
      .reverse()
  )

  return {
    dir: {
      input: 'src',
      output: 'public',
    },
    templateFormats: [
      'css',
      'ejs',
      'gif',
      'htaccess',
      'htm',
      'html',
      'ico',
      'jpg',
      'md',
      'mp3',
      'mp4',
      'ogg',
      'php',
      'png',
      'pug',
      'svg',
      'txt',
      'webm',
      'webp',
      'xml',
      'zip',
    ],
  }
}
