import ejsPlugin from '@11ty/eleventy-plugin-ejs'
import bundlePlugin from '@11ty/eleventy-plugin-bundle'
import pugPlugin from '@11ty/eleventy-plugin-pug'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import { readFileSync } from 'fs'
import path from 'path'
// import cacheBuster from '@mightyplow/eleventy-plugin-cache-buster'

export default function (eleventyConfig) {
  const siteCssPath = path.join(process.cwd(), 'src/styles/index.css')
  const homeCssPath = path.join(process.cwd(), 'src/styles/home.css')
  const portfolioCssPath = path.join(process.cwd(), 'src/styles/portfolio.css')
  const blogCssPath = path.join(process.cwd(), 'src/styles/blog.css')
  const photosCssPath = path.join(process.cwd(), 'src/styles/photos.css')

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
    if (this.page.url === '/') {
      cssManager.addToPage(this.page.url, readFileSync(homeCssPath, 'utf8'))
    }
    if (this.page.url.startsWith('/portfolio/')) {
      cssManager.addToPage(this.page.url, readFileSync(portfolioCssPath, 'utf8'))
    }
    if (this.page.url.startsWith('/blog/')) {
      cssManager.addToPage(this.page.url, readFileSync(blogCssPath, 'utf8'))
    }
    if (this.page.url.startsWith('/photos/')) {
      cssManager.addToPage(this.page.url, readFileSync(photosCssPath, 'utf8'))
    }
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
