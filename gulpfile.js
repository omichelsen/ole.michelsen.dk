import gulp from 'gulp'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import gdata from 'gulp-data'
import gexif from 'gulp-exif'
import gm from 'gulp-gm'
import jeditor from 'gulp-json-editor'
import gulpless from 'gulp-less'
import merge from 'gulp-merge-json'
import newer from 'gulp-newer'
import rename from 'gulp-rename'
import streamify from 'gulp-streamify'
import webp from 'gulp-webp'
import sizeOf from 'image-size'
import path from 'path'
import request from 'request'
import source from 'vinyl-source-stream'

const gpsDecimal = (direction, degrees, minutes, seconds) => {
  const d = degrees + minutes / 60 + seconds / (60 * 60)
  return direction === 'S' || direction === 'W' ? d * -1 : d
}

const roundDecimal = (dec) => parseFloat(dec.toFixed(4))

export const exif = () =>
  gulp
    .src('./exif/gps/*.jpg')
    .pipe(gexif())
    .pipe(
      gdata((file) => {
        const { width, height } = sizeOf(file.path)
        const filename = path.basename(file.path)
        const img = {
          lat: roundDecimal(
            gpsDecimal(
              file.exif.gps.GPSLatitudeRef,
              ...file.exif.gps.GPSLatitude
            )
          ),
          lng: roundDecimal(
            gpsDecimal(
              file.exif.gps.GPSLongitudeRef,
              ...file.exif.gps.GPSLongitude
            )
          ),
          width,
          height,
        }
        file.contents = Buffer.from(JSON.stringify({ [filename]: img }))
      })
    )
    .pipe(merge({ fileName: 'exif.json' }))
    .pipe(gulp.dest('./src/_data'))

const convertToWebp = () =>
  gulp
    .src('./exif/gps/*.jpg')
    .pipe(newer({ dest: './src/photos/map', ext: '.webp' }))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest('./src/photos/map'))

const resize = (source, dest, w, h, suffix = '') =>
  gulp
    .src(source)
    .pipe(newer({ dest, ext: '.jpg' }))
    .pipe(
      gm(
        (file) =>
          file
            .resize(w, h, '^')
            .gravity('Center')
            .extent(w, h)
            .quality(0.95)
            .setFormat('jpg'),
        {
          imageMagick: true,
        }
      )
    )
    .pipe(rename({ suffix }))
    .pipe(gulp.dest(dest))

const square = () =>
  resize('./exif/source/square/*.jpeg', './exif/gps', 100, 100)
const portrait = () =>
  resize('./exif/source/portrait/*.jpeg', './exif/gps', 100, 206)
const landscape = () =>
  resize('./exif/source/landscape/*.jpeg', './exif/gps', 206, 100)
const large = () => resize('./exif/source/large/*.jpeg', './exif/gps', 206, 206)

export const travel = gulp.series(
  gulp.parallel(square, portrait, landscape, large),
  exif,
  convertToWebp
)

const autumn1 = () =>
  resize('./photos/autumn/*.jpg', './src/photos/autumn', 200, 300)

const autumn2 = () =>
  resize('./photos/autumn/*.jpg', './src/photos/autumn', 400, 600, '@2x')

const autumnWebp = (source) =>
  function jpgToWebp() {
    return gulp
      .src(`${source}/*.jpg`)
      .pipe(newer({ dest: source, ext: '.webp' }))
      .pipe(webp({ quality: 80 }))
      .pipe(gulp.dest(source))
  }

export const galleryAutumn = gulp.series(
  gulp.parallel(autumn1, autumn2),
  autumnWebp('./src/photos/autumn')
)

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
    .src('./src/styles/index.less')
    .pipe(gulpless())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('./src/styles'))

export const watch = () => gulp.watch('./src/styles/**/*.less', styles)
