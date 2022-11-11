const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const gdata = require('gulp-data')
const gexif = require('gulp-exif')
const jeditor = require('gulp-json-editor')
const gulpless = require('gulp-less')
const imageResize = require('gulp-image-resize')
const merge = require('gulp-merge-json')
const streamify = require('gulp-streamify')
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
    .src('./exif/*.jpg')
    .pipe(gexif())
    .pipe(
      gdata((file) => {
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
          width: file.exif.exif.ExifImageWidth,
          height: file.exif.exif.ExifImageHeight,
        }
        file.contents = Buffer.from(JSON.stringify({ [filename]: img }))
      })
    )
    .pipe(merge({ fileName: 'exif.json' }))
    .pipe(gulp.dest('./src/_data'))

const travel = () => 
  gulp.src('./exif/source/square/*.jpeg')
    .pipe(imageResize({
      width: 100,
      height: 100,
      crop: true,
      gravity: 'Center',
      quality: 0.85,
      format: 'jpg',
    }))
    .pipe(gulp.dest('./exif'))
  
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
