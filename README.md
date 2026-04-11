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

#### `photos-exif-to-json.sh`

Scans all photos in `exif/` for EXIF data and outputs to `src/_data/exif.json` to use in Travel Map.

- `./photos-exif-to-json.sh -i ./src/photos/travel-map/converted -o ./src/_data/exif.json`

#### `gulp flickr`

Downloads a list of Flickr albums for Photos to `src/_data/flickr.json`.

#### `gulp github`

Downloads a list of repositories for Profile to `src/_data/github.json`.

#### `gulp styles`

Parse SASS to CSS to `src/styles/index.css`.

#### `photos-convert.sh`

Convert source AVIF or JPEG images to AVIF, WEBP and JPEG with optional custom sizing via `--width` and `--height`.

`./photos.sh` to get a list of images and resolution.

`./photos-to-avif.sh ./src/photos/autumn` to convert a folder of JPG, JPEG, or HEIC images into AVIF (used to store originals without taking too much space).

- Landing page hero: `./photos-convert.sh -s ./src/images/landing -o ./src/images/landing/converted -w 1920 -h 1080`
- Landing page tiles: `./photos-convert.sh -s ./src/images/landing/tiles -o ./src/images/landing/tiles/converted -w 300 -h 200`
- Photos: `./photos-convert.sh -s ./src/photos/index -o ./src/photos/index/converted -w 1920 -h 1080`
- Architecture: `./photos-convert.sh -s ./src/photos/architecture -o ./src/photos/architecture/converted -w 200`
- Autumn: `./photos-convert.sh -s ./src/photos/autumn -o ./src/photos/autumn/converted -w 200 -h 300`
- BRZ: `./photos-convert.sh -s ./src/photos/brz -o ./src/photos/brz/converted/ -w 200 -h 300`
- Miata:
  ```
  ./photos-convert.sh -s ./src/photos/miata/landscape -o ./src/photos/miata/converted -w 405 -h 269 &
  ./photos-convert.sh -s ./src/photos/miata/portrait -o ./src/photos/miata/converted -w 200 -h 300 &
  wait
  ```
