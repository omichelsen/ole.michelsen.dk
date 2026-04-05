# ole.michelsen.dk

[![Netlify Status](https://api.netlify.com/api/v1/badges/f4f659af-a73b-4923-be40-b2bf6acc10f7/deploy-status)](https://app.netlify.com/sites/omichelsen/deploys)

## Build

`pnpm build`

## Development

`pnpm start`

Install dependencies with `pnpm install`.

## Test

To install the required Ruby dependencies:

```shell
bundle install --deployment
```

Tests can now be run with `pnpm test` or `./test.sh`.

## Debug

To run [Netlify lambda functions](https://github.com/netlify/cli/blob/master/docs/netlify-dev.md#netlify-functions):

```shell
# start a dev server
netlify dev

# invoke lambda
netlify functions:invoke validator-sitemap --querystring "url=https://ole.michelsen.dk/sitemap.xml"
netlify functions:invoke validator-proxy --querystring "url=https://ole.michelsen.dk/"
```

## Scripts

#### `photos-to-avif.sh`

Converts photos to AVIF with custom sizes:

```
./photos-to-avif.sh -i ./src/photos/travel-map/landscape -o ./src/photos/travel-map/converted -w 206 -h 100 -q 50 &
./photos-to-avif.sh -i ./src/photos/travel-map/large -o ./src/photos/travel-map/converted -w 206 -h 206 -q 50 &
./photos-to-avif.sh -i ./src/photos/travel-map/portrait -o ./src/photos/travel-map/converted -w 100 -h 206 -q 50 &
./photos-to-avif.sh -i ./src/photos/travel-map/square -o ./src/photos/travel-map/converted -w 100 -h 100 -q 50 &
wait
```

Scans all photos in `exif/source` and create thumbnails and output for `gulp exit`.

#### `photos-exif-to-json.sh`

Scans all photos in `exif/` for EXIF data and outputs to `src/_data/exif.json` to use in Travel Map.

- `./photos-exif-to-json.sh -i ./src/photos/travel-map/converted -o ./src/_data/exif.json`

#### `gulp flickr`

Downloads a list of Flickr albums for Photos to `src/_data/flickr.json`.

#### `gulp github`

Downloads a list of repositories for Profile to `src/_data/github.json`.

#### `gulp styles`

Parse SASS to CSS to `src/styles/index.css`.

#### `photos-generate.sh`

Convert source AVIF or JPEG images to AVIF, WEBP and JPEG with optional custom sizing via `--width` and `--height`.

`./photos.sh` to get a list of images and resolution.

`./photos-to-avif.sh ./src/photos/autumn` to convert a folder of JPG into AVIF (used to store originals without taking too much space).

- Landing page hero: `./photos-generate.sh ./src/images/landing -w 1920 -H 1080 -a 40`
- Landing page tiles: `./photos-generate.sh ./src/images/landing/tiles -w 300 -H 200 -a 60`
- Photos: `./photos-generate.sh ./src/photos/index -w 1920 -H 1080 -a 40`
- Autumn: `./photos-generate.sh ./src/photos/autumn -w 200 -H 300 -a 60`
- BRZ: `./photos-generate.sh ./src/photos/brz -w 200 -H 300 -a 60`