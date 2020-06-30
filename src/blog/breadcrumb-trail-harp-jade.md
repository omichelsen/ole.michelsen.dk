---
title: Breadcrumb trail with Harp and Jade
description: How to create a microdata breadcrumb trail with Harp and Jade using the current page navigation path.
date: 2014-09-17
tags:
  - blog
  - archive
# tags: ["harp", "jade", "javascript", "microdata"]
---

I have always liked the concept of static site generation for sites, which really doesn’t need constant updates through the day (like mine). So recently I decided to check out the [vast amount of offerings](https://www.staticgen.com/), and fell upon [Harp](http://harpjs.com/).

In this brief article I will show how to make a [microdata breadcrumb](https://support.google.com/webmasters/answer/185417) trail using the [Jade templating engine](http://jade-lang.com/). For those new to Jade, like me, it will show a few of the key features in Jade.

<!-- more-->

> A microdata breadcrumb trail is metadata markup of a series of links, which is read by Google and presented in the search results.

So let’s start coding. Our breadcrumbs will be implemented as a partial, so let’s make a file called `/public/_shared/breadcrumbs.jade`.

First we add a [mixin](http://jade-lang.com/reference/mixins/), which is a piece of saved code or markup, that we can reuse. We will create a Jade template for one breadcrumb link, which has a URL and a title:

```pug
mixin breadcrumb(url, title)
  span(itemscope, itemtype='http://data-vocabulary.org/Breadcrumb')
    a(href='https://ole.michelsen.dk/', itemprop='url')
      span(itemprop='title')= title
```

Now we can use this mixin to loop through the current path, which is made available for us by Harp in a global variable [current](http://harpjs.com/docs/development/current):

```pug
+breadcrumb('/', 'Home')
each item in current.path.slice(0, -1)
  | › 
  +breadcrumb(item, item)
| › 
span.current= current.source
```

You will notice that we use `.slice()` on the path, and that is to remove the current page, as we want to print this in plain text. This will create a breadcrumb trail that looks like this:

<p class="indent">
  <span style="color: #00f; text-decoration: underline;">Home</span> › <span style="color: #00f; text-decoration: underline;">articles</span> › Harp
</p>

Mind you we are just writing out the path, so the title will probably be in lowercase. We can fix that with a Jade function:

```pug
- function capitalize(string) {
  - return string.charAt(0).toUpperCase() + string.slice(1);
- }
```

Now we are done, so let’s look at the final result:

```pug
- function capitalize(string) {
  - return string.charAt(0).toUpperCase() + string.slice(1);
- }

mixin breadcrumb(url, title)
  span(itemscope, itemtype='http://data-vocabulary.org/Breadcrumb')
    a(href='https://ole.michelsen.dk/', itemprop='url')
      span(itemprop='title')= title

+breadcrumb('/', 'Home')
each item in current.path.slice(0, -1)
  | › 
  +breadcrumb(item, capitalize(item))
| › 
span.current= capitalize(current.source)
```

Now our breadcrumbs should look like this:

<p class="indent">
  <span style="color: #00f; text-decoration: underline;">Home</span> › <span style="color: #00f; text-decoration: underline;">Articles</span> › Harp
</p>

So now our partial is done, we can use it anywhere in our code. So let’s add it somewhere in our `/public/_layout.jade` file:

```pug
p#sitemappath
  != partial('../_shared/breadcrumbs')
```

Thanks for reading. This was my first peek into Harp, but I think the project looks promising, and I'm looking forward to see the platform mature.
