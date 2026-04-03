import ejsPlugin from '@11ty/eleventy-plugin-ejs'
import bundlePlugin from '@11ty/eleventy-plugin-bundle'
import pugPlugin from '@11ty/eleventy-plugin-pug'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import { readFileSync } from 'fs'
import path from 'path'
// import cacheBuster from '@mightyplow/eleventy-plugin-cache-buster'

export default function (eleventyConfig) {
  const siteCssPath = path.join(process.cwd(), 'src/styles/index.css')

  // Pug does not support paired shortcodes in this setup, so we add global CSS
  // to each page bundle here.
  eleventyConfig.addTransform('bundle-global-css', function (content) {
    if (!this.page?.url) return content
    if (!content.includes('/*__EleventyBundle:get:css:default:EleventyBundle__*/')) {
      return content
    }

    const cssManager = eleventyConfig.getBundleManagers?.().css
    if (!cssManager) return content

    cssManager.addToPage(this.page.url, readFileSync(siteCssPath, 'utf8'))
    return content
  })

  eleventyConfig.setQuietMode(true)

  // eleventyConfig.addPlugin(cacheBuster({ outputDirectory: 'public' }))
  eleventyConfig.addPlugin(bundlePlugin, { bundles: false })
  eleventyConfig.addBundle('css', { delayed: true })
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
      'avif',
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
