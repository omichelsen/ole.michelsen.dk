---
title: Best export format from Lightroom to Apple Photos
description: Evaluation of JXL format for exporting high quality SDR and HDR photos from Lightroom (Mobile) to Apple Photos.
date: 2025-06-08
---

My photography workflow includes importing and editing photos in Lightroom (Mobile) and then exporting them to Apple Photos to organize and share.

Photos shot natively on an iPhone uses HEIF to allow for better quality. Since I'm exporting my photos in JPG, they can actulaly look worse than ones shot on a phone despite shooting in RAW on a DSLR. JPG only have 8-bit color and no HDR support.

To replace the aging JPG format for my exports, I set out to find a replacement to realize the following improvements:

- Wider color gamut (10-bit)
- HDR support
- Smaller file sizes with higher quality

The key requirements for my use cases are:

- Viewing on iOS devices (iPhone, iPad)
- Viewing on Apple TV
- Sharing using Apple Photos Shared Albums
- Exporting to printing services

## JPEG XL to rule them all?

JPEG (JXL) promises to be the latest and greatest. The one to replace them all. It supports [better compression](https://jpegxl.info), lossless, progressive decoding, HDR, up to 32-bit color. This should be a slam dunk - or so I thought.

I soon realized that, depending on the Lightroom export settings, my images had comletely wrong colors when imported in Apple Photos. Enable HDR and results would be even worse, with images occasionally [not rendering at all](/images/blog/best-export-format-lightroom-mobile-to-apple-photos/sdr-prophoto-shared.webp).

I don't know if Adobe or Apple is to blame here (export vs import), but I set out to find if there was a magic combination of settings that would give me a usable result.

## Testing methodology

I will be using JXL quality 90% for all exports and compare them to JPG 100% since this is a more fair setting for equal picture quality. It's not meant to be an accurate comparison of which format has best compression which is [covered elsewhere](https://cloudinary.com/blog/how_jpeg_xl_compares_to_other_image_codecs).

My goal is to compare color accuracy to the original edit in Lightroom, and reliable results when sharing the photos elsewhere. I will test all available color spaces, a deeper explanation of the [differences are covered here](https://www.lightroomqueen.com/color-space-use/).

### SDR

<div class="tableWrapper">

| Color Space | File size JXL/JPG | Photos | Shared Album | Example |
| ----------- | ----------------- | ------ | ------------ | ------- |
| sRGB | 2.8 MB vs 16.7 MB | Works | Works | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/sdr-srgb.webp" alt="SDR sRGB" loading="lazy" width="106" height="154"> |
| Display P3 | 2.6 MB vs 16.4 MB | Works | Works | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/sdr-p3.webp" alt="SDR P3" loading="lazy" width="106" height="154"> |
| Adobe RGB | 11.6 MB vs 16.7 MB | Works | Works | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/sdr-adobergb.webp" alt="SDR AdobeRGB" loading="lazy" width="106" height="154"> |
| ProPhoto RGB | 9.8 MB vs 16.4 MB | Works | Broken | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/sdr-prophoto-shared.webp" alt="SDR ProPhoto RGB Shared Album" loading="lazy" width="106" height="154" class="image-fixed"> |

</div>

\* Colors show a little darker than the original edit

### HDR

I included AVIF in this comparison since it also supports HDR. I wanted to see if there were alternative formats that yielded more reliable results.

Testing for "Photos" is done on a M2 MacBook Air and iPhone 16 Pro. Both should support HDR but my experience varied widely.

<div class="tableWrapper">

| Format | Color Space | File size JXL/JPG | MacBook Air | iPhone 16 Pro | Shared Album | Example |
| ------ | ----------- | ----------------- | ----------- | ------------- | ------------ | ------- |
| JXL | sRGB | 2.6 MB vs 16.7 MB | Thumbnail colors off, gets better when opened but still not matching original. Pop-in. | Colors off. | Colors off. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-colors-bad.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |
| JXL | Display P3 | 2.6 MB vs 16.4 MB | Thumbnail colors off, gets better when opened but still not matching original. Pop-in. | Colors off. | Colors off. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-colors-bad.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |
| JXL | Rec. 2020 | 2.6 MB vs 16.7 MB | Thumbnail match when opened but still not matching original. | Colors close to original but darker. | Colors like Photos. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-colors-good.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |
| AVIF | sRGB | 647 KB vs 16.7 MB | Thumbnail colors off, works when opened. Pop-in. | Colors off. | Colors off. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-avif-srgb.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |
| AVIF | Display P3 | 569 KB vs 16.4 MB | Thumbnail colors off, works when opened. Pop-in. | Colors off. | Colors off. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-avif-p3.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |
| AVIF| Rec. 2020 | 536 KB vs 16.7 MB | Works | Works | Colors like Photos. No HDR. | <img src="/images/blog/best-export-format-lightroom-mobile-to-apple-photos/hdr-avif-rec2020.webp" alt="Colors showing too dark" loading="lazy" width="106" height="154"> |

</div>

## Conclusion

For SDR content JXL is a very viable option. We can realize the benefits of JXL with relatively reliable results. Colors look close enough to the original Lightroom edit, and sharing (which will convert to JPG) works.

HDR is a complete mess. Colors rarely look like the original, and rendering across devices look completely different. HDR stops working when images are shared. This is sad because Apple seems to have nailed this with their native HEIF images shot on the iPhone, which looks "right" regardless of device SDR/HDR capabilities.

| Dynamic Range | Format | Color Space | Comments |
| ------------- | ------ | ----------- | -------- |
| SDR | JXL | Display P3 | [P3 has a wider color space than sRGB](https://arounda.agency/blog/colors-in-screens-the-story-of-srgb-and-dci-p3) for same file size. AdobeRGB blows up the file size with no visual difference. |
| HDR | JXL | Rec. 2020 | I really want to stick with JXL even though it doesn't work as well as AVIF. The latter is designed for web and too destructive for my purposes. |
