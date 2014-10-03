var gulp = require('gulp');
var ftp = require('gulp-ftp');
var shell = require('gulp-shell');

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

gulp.task('default', ['harp', 'ftp']);
