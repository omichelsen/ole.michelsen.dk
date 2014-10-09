var gulp = require('gulp'),
    data = require('gulp-data'),
    exif = require('gulp-exif'),
    extend = require('gulp-extend'),
    ftp = require('gulp-ftp'),
    shell = require('gulp-shell');

function gpsDecimal(direction, degrees, minutes, seconds) {
    var d = degrees + minutes / 60 + seconds / (60 * 60);
    return (direction === 'S' || direction === 'W') ? d *= -1 : d;
}

function roundDecimal(dec) {
    return parseFloat(dec.toFixed(4));
}

gulp.task('harp', shell.task([
    'harp compile'
]));

gulp.task('ftp', ['harp'], function () {
    return gulp.src('www/**/*')
        .pipe(ftp({
            host: 'ftp.michelsen.dk',
            user: 'michelsen.dk',
            pass: '45aber0gud',
            remotePath: '/ole/test'
        }));
});

gulp.task('exif', function () {
    return gulp.src('./public/photos/map/*.jpg')
        .pipe(exif())
        .pipe(data(function (file) {
            var filename = file.path.substring(file.path.lastIndexOf('/') + 1),
                calcLat = gpsDecimal.bind(null, file.exif.gps.GPSLatitudeRef),
                calcLng = gpsDecimal.bind(null, file.exif.gps.GPSLongitudeRef),
                img = {
                    lat: roundDecimal(calcLat.apply(null, file.exif.gps.GPSLatitude)),
                    lng: roundDecimal(calcLng.apply(null, file.exif.gps.GPSLongitude)),
                    width: file.exif.exif.ExifImageWidth,
                    height: file.exif.exif.ExifImageHeight
                },
                data = {};
            data[filename] = img;
            file.contents = new Buffer(JSON.stringify(data));
        }))
        .pipe(extend('exif.json'))
        .pipe(gulp.dest('./public/photos'));
});

// gulp.task('default', ['harp', 'ftp']);
gulp.task('default', ['exif']);
