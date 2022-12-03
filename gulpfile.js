const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const gdata = require('gulp-data')
const gexif = require('gulp-exif')
const gm = require('gulp-gm')
const jeditor = require('gulp-json-editor')
const gulpless = require('gulp-less')
const merge = require('gulp-merge-json')
const newer = require('gulp-newer')
const streamify = require('gulp-streamify')
const webp = require('gulp-webp')
const sizeOf = require('image-size')
const path = require('path')
const request = require('request')
const source = require('vinyl-source-stream')

const gpsDecimal = (direction, degrees, minutes, seconds) => {
  const d = degrees + minutes / 60 + seconds / (60 * 60)
  return direction === 'S' || direction === 'W' ? d * -1 : d
}

const roundDecimal = (dec) => parseFloat(dec.toFixed(4))

const exif = () =>
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

const travelResize = (type, w, h) =>
  gulp
    .src(`./exif/source/${type}/*.jpeg`)
    .pipe(newer({ dest: './exif/gps', ext: '.jpg' }))
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
    .pipe(gulp.dest('./exif/gps'))

const square = () => travelResize('square', 100, 100)
const portrait = () => travelResize('portrait', 100, 206)
const landscape = () => travelResize('landscape', 206, 100)
const large = () => travelResize('large', 206, 206)

const travel = gulp.series(
  gulp.parallel(square, portrait, landscape, large),
  exif,
  convertToWebp
)

const flickr = () =>
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

const github = () =>
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

const styles = () =>
  gulp
    .src('./src/styles/index.less')
    .pipe(gulpless())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('./src/styles'))

const watch = () => gulp.watch('./src/styles/**/*.less', styles)

exports.exif = exif
exports.travel = travel
exports.flickr = flickr
exports.github = github
exports.styles = styles
exports.watch = watch
