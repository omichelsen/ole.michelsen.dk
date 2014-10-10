In this tutorial I will go through how to read the EXIF data from a folder of photots, and show the GPS location where each photo was taken in [Google Maps](https://maps.google.com/). This article is based on the code I wrote to make my personal [World Travel Map](http://ole.michelsen.dk/photos/travel-map.html), which shows where I've been based on my vacation shots.

We'll use the [gulp](http://gulpjs.com/) build system to read the image files and output the data we need to a JSON file, which we can then read into Google Maps.

<!-- more-->

First we install gulp and a couple of packages, [gulp-data](https://github.com/colynb/gulp-data), [gulp-exif](https://github.com/Shimonenator/gulp-exif) and [gulp-extend](https://github.com/adamayres/gulp-extend):

`npm install --save-dev gulp gulp-data gulp-exif gulp-extend`

This will allow us to read the EXIF data from the image files, extract the part we need (GPS coordinates), and save it all into a single JSON file. So let's setup the modules in the `gulpfile.js`:

    var gulp = require('gulp'),
        data = require('gulp-data'),
        exif = require('gulp-exif'),
        extend = require('gulp-extend');

Now we create a task called "exif", which does three things:

- Reads the EXIF data from the images in the `photos` folder
- Plucks out the GPS data and puts it in a JSON format with the filename as the key
- Joins the JSON data into a single `gps.json` file

The whole task looks like this:

    gulp.task('exif', function () {
        return gulp.src('./photos/*.jpg')
            .pipe(exif())
            .pipe(data(function (file) {
                var filename = file.path.substring(file.path.lastIndexOf('/') + 1),
                    data = {};
                data[filename] = file.exif.gps;
                file.contents = new Buffer(JSON.stringify(data));
            }))
            .pipe(extend('gps.json', true, '    '))
            .pipe(gulp.dest('./'));
    });

If we run this tasks with `gulp exif`, we get a nice `gps.json` file with contents similar to this:

    {
        "2011-10-25.jpg": {
            "GPSLatitudeRef": "N",
            "GPSLatitude": [
                40,
                25.11,
                0
            ],
            "GPSLongitudeRef": "E",
            "GPSLongitude": [
                15,
                0.3,
                0
            ]
        }
    }

That is all well and good, but unfortunately we can't use this directly, as Google Maps require coordinates to be in the [decimal notation](http://en.wikipedia.org/wiki/Decimal_degrees). To convert the format of our coordinates, we start by adding this helper function to our `gulpfile.js`: 

    function gpsDecimal(direction, degrees, minutes, seconds) {
        var d = degrees + minutes / 60 + seconds / (60 * 60);
        return (direction === 'S' || direction === 'W') ? d *= -1 : d;
    }

Then we just have to use it, so we extend our "exif" task from before:

    gulp.task('exif', function () {
        return gulp.src('./photos/*.jpg')
            .pipe(exif())
            .pipe(data(function (file) {
                var filename = file.path.substring(file.path.lastIndexOf('/') + 1),
                    exif = file.exif.gps,
                    calcLat = gpsDecimal.bind(null, exif.GPSLatitudeRef),
                    calcLng = gpsDecimal.bind(null, exif.GPSLongitudeRef),
                    data = {};
                data[filename] = {
                    lat: calcLat.apply(null, exif.GPSLatitude),
                    lng: calcLng.apply(null, exif.GPSLongitude)
                };
                file.contents = new Buffer(JSON.stringify(data));
            }))
            .pipe(extend('gps.json', true, '    '))
            .pipe(gulp.dest('./'));
    });

And now if we run `gulp exif`, we should have a `gps.json` file looking like this instead:

    {
        "2011-10-25.jpg": {
            "lat": 40.4185,
            "lng": 15.005
        }
    }


## Google Maps

We are now ready to plot these coordinates on a map using Google Maps API v3. We just need to [obtain an API key](https://developers.google.com/maps/documentation/javascript/tutorial#api_key), and put some standard code in a web page:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=API_KEY"></script>
<script>
  function initialize() {
    var mapOptions = {
      center: { lat: 40.683, lng: 15.077},
      zoom: 8
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  }
  google.maps.event.addDomListener(window, 'load', initialize);
</script>
<div id="map-canvas"></div>
```

This boilerplate code will load up Google Maps, so let's plot in the GPS locations of our photos. Depending on your site setup you can embed the `gps.json` file directly in the page, but for this example we'll load it with jQuery:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script>
  function setMarkers(markers) {
    for (var key in markers) {
      new google.maps.Marker({
        position: new google.maps.LatLng(markers[key].lat, markers[key].lng),
        map: map
      });
    }
  }
  $.getJSON('gps.json', setMarkers);
</script>
```

And now we are done! You can see the result in action here:

<div id="map-canvas" style="width:100%;height:200px"></div>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCPqiUhRvSy2m5N__6fIvANVRq2j-q7w2A&amp;sensor=false"></script>
<script>
  function setMarkers(map, markers) {
    for (var key in markers) {
      new google.maps.Marker({
        position: new google.maps.LatLng(markers[key].lat, markers[key].lng),
        map: map
      });
    }
  }
  function initialize() {
    var mapOptions = {
      center: { lat: 40.683, lng: 15.077},
      zoom: 8
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    setMarkers(map, {
      "2011-10-25.jpg": {
        "lat": 40.4185,
        "lng": 15.005
      },
      "2011-10-26.jpg": {
        "lat": 40.66716666666667,
        "lng": 16.610500000000002
      }
    });
  }
  google.maps.event.addDomListener(window, 'load', initialize);
</script>

The entire code from this article is [available on GitHub](https://github.com/omichelsen/exif-gps-to-json-example), together with the Google Maps example.

