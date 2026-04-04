# ole.michelsen.dk

[![Netlify Status](https://api.netlify.com/api/v1/badges/f4f659af-a73b-4923-be40-b2bf6acc10f7/deploy-status)](https://app.netlify.com/sites/omichelsen/deploys)

## Build

`yarn build`

## Development

`yarn start`

## Test

To install the required Ruby dependencies:

```shell
bundle install --deployment
```

Tests can now be run with `yarn test` or `./test.sh`.

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

#### `gulp travel`

Scans all photos in `exif/source` and create thumbnails and output for `gulp exit`.

#### `gulp exif`

Scans all photos in `exif/` for EXIF data and outputs to `src/_data/exif.json` to use in Travel Map.

#### `gulp flickr`

Downloads a list of Flickr albums for Photos to `src/_data/flickr.json`.

#### `gulp github`

Downloads a list of repositories for Profile to `src/_data/github.json`.

#### `gulp styles`

Parse SASS to CSS to `src/styles/index.css`.

#### `photos-generate autumn|brz`

Convert source AVIF or JPEG images to AVIF, WEBP and JPEG with optional custom sizing via `--width` and `--height`, for example `./photos-generate.sh ./src/photos/brz/src --output ./src/photos/brz --width 200 --height 300`.

`./photos.sh` to get a list of images and resolution.

`./photos-to-avif.sh ./src/photos/autumn` to convert a folder of JPG into AVIF (used to store originals without taking too much space).
