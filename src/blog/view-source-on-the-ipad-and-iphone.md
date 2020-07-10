---
title: View source on the iPad and iPhone
description: View source on the iPad using a JavaScript bookmarklet to see the source code with syntax highlighting, selectable text and clickable links for URLs.
date: 2011-07-28
dateModified: 2020-06-25
//- tags: [ios, ipad, iphone, safari]
---

__Update__: _The bookmarklet has been updated to work with iOS 13+ and without a server backend_

My new iPad has become my primary tool for surfing, but alas it completely lacks a view source feature for looking at the source code of all those websites.

To get around this limitation we can use a _bookmarklet_ which is a piece of JavaScript saved as a bookmark. When you click the bookmark, the source code of the current page will be shown in a new window with a few bells and whistles:

<!-- more-->

- The code is syntax highlighted (using <a title="Prism" href="https://prismjs.com" target="_blank">Prism</a>)
- Links are clickable, so you can follow scripts etc.
- Text is fully selectable

<p>
  <picture>
    <source srcset="/images/blog/view-source-on-the-ipad-and-iphone/source.webp, /images/blog/view-source-on-the-ipad-and-iphone/source@2x.webp 2x" type="image/webp">
    <img
      alt="Clicking the bookmarklet will display the source of the web page in a new window/tab"
      itemprop="image"
      src="/images/blog/view-source-on-the-ipad-and-iphone/source.png"
      srcset="/images/blog/view-source-on-the-ipad-and-iphone/source@2x.png 2x"
      width="723"
      height="350"
    >
  </picture>
</p>

## The code

The following bookmarklet code copies the <abbr title="Document Object Model">DOM</abbr> and shows it in a new window with syntax highlighting:

```js
javascript:(() => {
  var e = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0',
  t = window.open('about:blank').document;
  t.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Source of ${location.href}</title>
        <link rel=stylesheet href=${e}/themes/prism.min.css>
      </head>
      <body bgcolor=#f5f2f0>
        <script src=${e}/components/prism-core.min.js></script>
        <script src=${e}/plugins/autoloader/prism-autoloader.min.js></script>
        <script src=${e}/plugins/autolinker/prism-autolinker.min.js></script>
      </body>
    </html>`),
  t.close();
  var r = t.body.appendChild(t.createElement('pre')).appendChild(t.createElement('code'));
  r.className = 'language-html',
  r.appendChild(t.createTextNode(document.documentElement.outerHTML))
})();
```

## How to install it

To add it on your computer and sync it to your iPad, just drag this link to your bookmarks:

<a onclick="(()=>{var e='https://cdnjs.cloudflare.com/ajax/libs/prism/1.20.0',t=window.open('about:blank').document;t.write(`<!DOCTYPE html><html><head><title>Source of ${location.href}</title><link rel=stylesheet href=${e}/themes/prism.min.css></head><body bgcolor=#f5f2f0><script src=${e}/components/prism-core.min.js></script><script src=${e}/plugins/autoloader/prism-autoloader.min.js></script><script src=${e}/plugins/autolinker/prism-autolinker.min.js></script></body></html>`),t.close();var r=t.body.appendChild(t.createElement('pre')).appendChild(t.createElement('code'));r.className='language-html',r.appendChild(t.createTextNode(document.documentElement.outerHTML))})();" title="View Source Bookmarklet">View Source</a> _(click to try it out)_

To add it directly from your iPad (or iPhone), you need to create the bookmark manually:

1. Add this page as a bookmark
1. Then [click here to see the bookmarklet code](/scripts/bookmarklet.min.js) and Select All → Copy
1. Now edit that same bookmark, paste the code you just copied into the URL and name it something like "View Source"

<p>
  <picture>
    <source srcset="/images/blog/view-source-on-the-ipad-and-iphone/bookmarklet.webp, /images/blog/view-source-on-the-ipad-and-iphone/bookmarklet@2x.webp 2x" type="image/webp">
    <img
      alt="Edit the bookmark and paste the bookmarklet code"
      src="/images/blog/view-source-on-the-ipad-and-iphone/bookmarklet.png"
      srcset="/images/blog/view-source-on-the-ipad-and-iphone/bookmarklet@2x.png 2x"
      width="600"
      height="450"
    >
  </picture>
</p>

Voilá!

Note that the source shown is the generated <abbr title="Document Object Model">DOM</abbr>, and not the original HTML. These might differ depending on the amount of JavaScript used on the page.

_Originally inspired by <a title="iPad View Source Bookmarklet" href="http://www.ravelrumba.com/blog/ipad-view-source-bookmarklet/" target="_blank">this bookmarklet from Rob Flaherty</a>._