import gulp from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import jeditor from 'gulp-json-editor'
import gulpSass from 'gulp-sass'
import streamify from 'gulp-streamify'
import request from 'request'
import * as sassCompiler from 'sass'
import source from 'vinyl-source-stream'

const sass = gulpSass(sassCompiler)

export const flickr = () =>
  request(
    'https://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=62b36a8cf6e44b19d379f36b51bb4535&format=json&nojsoncallback=1&user_id=16324363@N07&primary_photo_extras=url_s'
  )
    .pipe(source('flickr.json'))
    .pipe(
      streamify(
        jeditor((json) =>
          json.photosets.photoset.map((set) => ({
            id: set.id,
            title: set.title._content,
            thumbnail: {
              url: set.primary_photo_extras.url_s,
              width: set.primary_photo_extras.width_s,
              height: set.primary_photo_extras.height_s,
            },
          }))
        )
      )
    )
    .pipe(gulp.dest('./src/_data'))

export const github = () =>
  request({
    url: 'https://api.github.com/users/omichelsen/repos',
    headers: {
      'User-Agent': 'request',
    },
  })
    .pipe(source('github.json'))
    .pipe(
      streamify(
        jeditor((res) =>
          res
            .filter(({ fork }) => !fork)
            .sort(({ watchers_count: a }, { watchers_count: b }) => b - a)
            .map(
              ({ description, html_url, language, name, watchers_count }) => ({
                description,
                html_url,
                language,
                name,
                watchers_count,
              })
            )
        )
      )
    )
    .pipe(gulp.dest('./src/_data'))

export const styles = () =>
  gulp
    .src([
      './src/styles/index.scss',
      './src/styles/home.scss',
      './src/styles/portfolio.scss',
      './src/styles/blog.scss',
      './src/styles/photos.scss',
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('./src/styles'))

export const watch = () => gulp.watch('./src/styles/**/*.scss', styles)
