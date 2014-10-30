var gulp = require('gulp'),
    data = require('gulp-data'),
    exif = require('gulp-exif'),
    extend = require('gulp-extend'),
    ftp = require('gulp-ftp'),
    fs = require('fs'),
    request = require('request'),
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
    return gulp.src('./public/images/photos/_map/*.jpg')
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
                data = {
                    'travel-map': {
                        'images': {}
                    }
                };
            data['travel-map'].images[filename] = img;
            file.contents = new Buffer(JSON.stringify(data));
        }))
        .pipe(extend('_exif.json', true, '    '))
        .pipe(gulp.dest('./public/photos'));
});

gulp.task('flickr', function () {
    var options = {
        url: 'https://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=62b36a8cf6e44b19d379f36b51bb4535&format=json&nojsoncallback=1&user_id=16324363@N07&primary_photo_extras=url_s',
        headers: {
            'User-Agent': 'request'
        }
    };
    return request(options)
        .pipe(fs.createWriteStream('./public/photos/_flickr.json'));
});

gulp.task('flickr-format', ['flickr'], function () {
    return gulp.src('./public/photos/_flickr.json')
        .pipe(data(function (file) {
            var data = {
                'index': {
                    'flickr': []
                }
            };
            var json = JSON.parse(file.contents);
            json.photosets.photoset.forEach(function (set) {
                data.index.flickr.push({
                    id: set.id,
                    title: set.title._content,
                    thumbnail: {
                        url: set.primary_photo_extras.url_s,
                        width: set.primary_photo_extras.width_s,
                        height: set.primary_photo_extras.height_s
                    }
                });
            });
            file.contents = new Buffer(JSON.stringify(data));
        }))
        .pipe(gulp.dest('./public/photos'));
});

gulp.task('photos-data', ['exif', 'flickr-format'], function () {
    return gulp.src('./public/photos/_*.json')
        .pipe(extend('_data.json', true, '    '))
        .pipe(gulp.dest('./public/photos'));
});

gulp.task('github', function () {
    var options = {
        url: 'https://api.github.com/users/omichelsen/repos',
        headers: {
            'User-Agent': 'request'
        }
    };
    return request(options)
        .pipe(fs.createWriteStream('./public/_github.json'));
});

gulp.task('github-format', ['github'], function () {
    return gulp.src('./public/_github.json')
        .pipe(data(function (file) {
            var data = {
                'profile': {
                    'repositories': []
                }
            };
            var repositories = JSON.parse(file.contents);
            repositories.forEach(function (repo) {
                data.profile.repositories.push({
                    html_url: repo.html_url,
                    name: repo.name,
                    language: repo.language,
                    description: repo.description
                });
            });
            file.contents = new Buffer(JSON.stringify(data));
        }))
        .pipe(gulp.dest('./public'));
});

gulp.task('github-data', ['github-format'], function () {
    return gulp.src('./public/_*.json')
        .pipe(extend('_data.json', true, '    '))
        .pipe(gulp.dest('./public'));
});

gulp.task('default', ['exif', 'flickr', 'flickr-format', 'photos-data', 'github', 'github-format', 'github-data']);
