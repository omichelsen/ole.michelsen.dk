---
title: Using WebP images in HTML and CSS
description: How to use WebP images in HTML and CSS with dark mode support and fallback for non-retina and unsupported browsers.
date: 2021-10-24
tags: blog
---
<!--
//- https://css-tricks.com/using-webp-images/
//- https://raoulkramer.de/avif-webp-images-css-background-usage-progressive-enhanced-with-image-set/
-->

The [WebP](https://en.wikipedia.org/wiki/WebP) image format from Google promises to replace both JPEG and PNG/GIF with more efficient compression and higher quality. [Safari 14 recently added support](https://developer.apple.com/documentation/safari-release-notes/safari-14-release-notes#Media) for the format and it's now [supported in all major browsers](https://caniuse.com/?search=webp).

WebP supports lossy compression, like JPEG, where you chose a quality target between 1-100 (usually 75-85 yields nice results) and the image will be compressed. This can introduce artifacts (blocks) in the image but also great file size savings. Like PNG/GIF WebP also supports lossless compression, support for alpha transparancy and animations.

<!-- more-->

### Using WebP in HTML

You can use a WebP image in a normal `<img>` tag, but in browsers that without WebP support the image would be broken. 

Instead the `<picture>` tag allows us to specify a list of different image formats as well as versions for dark mode and various resolutions. The browser will pick the most appropriate version and fall back to the image defined in the `<img>` tag if WebP isn't supported:

```html
<picture>
  <source type="image/webp" srcset="dark@1x.webp 1x, dark@2x.webp 2x" media="(prefers-color-scheme: dark)">
  <source type="image/webp" srcset="light@1x.webp 1x, light@2x.webp 2x">
  <source type="image/jpeg" srcset="dark@1x.jpg 1x, dark@2x.jpg 2x" media="(prefers-color-scheme: dark)">
  <source type="image/jpeg" srcset="light@1x.jpg 1x, light@2x.jpg 2x">
  <img src="fallback-light@1x.jpg" alt="describe image content" loading="lazy">
</picture>
```

In the code above we have different image versions in both WebP and JPEG to support high-res displays with 2x pixel density as well as dark mode.

The image at the end of this article uses this code. Try and [toggle dark mode in your browser](https://developer.chrome.com/docs/devtools/customize/dark-theme/) to see it in effect.

### Using WebP in CSS

It's also possible to use WebP as a background with CSS. [`image-set`](https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set()) is an emerging notation which is now [supported on all major browsers](https://caniuse.com/?search=image-set) (some might require a `-webkit-` prefix). The concept is the same as above, we specify a range of different file types and resolutions of our image, and the browser will pick the appropriate version. As a fallback we specify a normal `background-image` instruction first:

```css
.masthead {
  background-image: url("fallback-light@1x.png");
  background-image: image-set(
    url("light@1x.webp") 1x,
    url("light@2x.webp") 2x,
    url("fallback-light@1x.png") 1x,
    url("fallback-light@2x.png") 2x
  );
}
```

To set the dark mode versions of the same images you can use a `@media` query:

```css
@media screen and (prefers-color-scheme: dark) {
  .masthead {
    background-image: url("fallback-dark@1x.png");
    background-image: image-set( ... );
  }
}
```

### Converting images to WebP

There's a number of good online converters and some allow you to fine tune the settings like [Squoosh](https://squoosh.app/).

Google also provides a handy command line tool [cwebp](https://developers.google.com/speed/webp/docs/using) to convert your images to WebP:

```shell
cwebp -q 80 image.png -o image.webp
```

After installing cwebp you can use macOS Automator to create a Quick Action, letting you right click multiple image files and convert them all to WebP:

<picture>
  <source type="image/webp" srcset="/images/blog/using-webp/automator-dark.webp 1x, /images/blog/using-webp/automator-dark@2x.webp 2x" media="(prefers-color-scheme: dark)">
  <source type="image/webp" srcset="/images/blog/using-webp/automator.webp 1x, /images/blog/using-webp/automator@2x.webp 2x">
  <source type="image/png" srcset="/images/blog/using-webp/automator-dark.png 1x, /images/blog/using-webp/automator-dark@2x.png 2x" media="(prefers-color-scheme: dark)">
  <source type="image/png" srcset="/images/blog/using-webp/automator.png 1x, /images/blog/using-webp/automator@2x.png 2x">
  <img src="/images/blog/using-webp/automator.png" alt="Creating an Automator Quick Action for converting images to WebP" loading="lazy" width="720" height="548">
</picture>

The script is here for copy+paste. The first line is to get the right `PATH` setup. You might have a different shell configuration (e.g. `~/.bashrc`).

```shell
source ~/.zshrc

for FILE in "$@"
do
	EXT=${FILE##*.}
	QUALITY=80 # quality for image (1-100)
	cwebp -q $QUALITY "$FILE" -o "${FILE/%.$EXT/.webp}"
done
```
