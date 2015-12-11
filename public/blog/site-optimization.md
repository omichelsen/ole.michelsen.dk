This is a presentation of the techniques and optimizations I have used on this site. The goal has been to create a website using all the latest standards, like HTML5 and CSS3, and exploring performance optimization techniques to reduce HTTP requests and compressing scripts etc.

<!-- more-->

### HTTP requests

Yahoo! recently did a report, finding that 80% of their page loading time was spent on the front-end, primarily downloading files like images, stylesheets etc. Thus it becomes relevant to reduce the number of these files, especially considering your browser will usually only download between 2-8 files simultaneously.

#### Sprites and base64 encoding

<div class="floatright">
    <span class="linkedin"></span>
    <span class="facebook"></span>
    <span class="twitter"></span>
</div>

To reduce the number of image files used on the page, I am using CSS3 gradients for backgrounds, and where <abbr title="title='User Interface'">UI</abbr> images like icons are required, I have placed them in sprites. Sprites remove the overhead of the file format by placing all the images in one file, and then shifting the visible part of the image.
      
Furthermore, to remove the HTTP requests of downloading the sprites, I have [base64 encoded](/tools/base64.html "Tools: Base64 Encoder") them directly into the stylesheet. Base64 encoding has some downsides though: it doesn't work in IE6 and IE7, and generally increases size by 1/3. This must be considered against the benefit of the reduced HTTP requests.

![YSlow Grade A - performance score 100/100](/images/blog/site-optimization/yslow-smallsite.png)

### Minification and compression

Compression like <abbr title="GNU zip">gzip</abbr> is always good, but for stylesheets and especially JavaScript, we can go one step further with [minification](/tools/minifier.html "Tools: Script Minifier")

Because the computer doesn't need the code to be humanly readable, we can remove all comments, line-breaks, spaces etc. For JavaScript we can even change variable names to "a, b, c...", since we can safely determine the scope of the variables.
      
For my site, minifying the stylesheet reduced size by 16%, and my JavaScripts by a whopping 46%! The overall reduction in file size using these compression techniques amounts to 57% for CSS, 78% for JS, and 60% for HTML, as shown in the chart below:
      
![Compression results of 57% for CSS, 78% for JS and 60% for HTML](/images/blog/site-optimization/compression.png)

_It's also possible to minify the HTML, but this require more control over the output/rendering process than I currently have implemented on my website._

### Caching

No UI content should be downloaded twice, so my static files like CSS and JS have an expiration date of 1 year. Cache-control and doing away with query strings also ensures that proxies will cache your content, allowed by setting the "public" parameter:

    Cache-Control: max-age=31557600, public

To update these files, a rename is now necessary (versioning), but this is well worth the extended caching.

### Performance

Measuring the performance and effect of these optimizations, can be done with a variety of tools. We can measure the use of best practice techniques described here with Google Page Speed. As you can see, my efforts have paid off, landing a solid score of 99/100:

![Page Speed Score 99/100](/images/blog/site-optimization/page-speed.png)

### Search Engine Optimization

High visibility on Google, Yahoo etc. is pretty important for everyone making websites, and it's key to find the right keywords for your content. If your keywords does not represent your actual content, your Page Rank will suffer.
Optimizing the code can help give you the extra edge, and I have focused on the following aspects:

* __Meta tags__
    - Author, Keywords and Description are nessecities which will also help present your page nicely in search results.
* __No dynamic URLs__
    -  This is not difficult on my small site, but doing away with query string-served content is a boon for both <abbr title="Search Engine Optimization">SEO</abbr> and proxy caching.
* __Quality content__
    - I think I've nailed this one pretty well ;-)
* __Unique content__
    - Ensuring content and especially title and meta tags are not duplicated on several pages is a big priority. In this regard it's important that a page has only _one_ unique URL, which can be a problem on larger sites with heavy use of query strings.

#### Lynx text browser

![This page when viewed through the Lynx web browser](/images/blog/site-optimization/lynx.png)

To really test your mettle, you can run your site through a text browser like Lynx. This can give you an idea how the web crawlers (as well as text-to-speak browsers for the handicapped) see your site, and how your content is actually structured when you cut away the design layer.

### Content Delivery Network

For major sites, using <abbr title="Content Delivery Network">CDN</abbr>s makes sure users will receive your content from the server nearest to them. My site is too small for this to be feasible for _all_ my content, but I'm using it in one important aspect, the _jQuery_ library.

Since jQuery is hosted on Google's API CDN, pointing to their version of the jQuery script means there's good chance visitors will already have this script cached.

This is a cursory glance of the main optimization techniques I have used on this site. Since my site is very small, these techniques have largely been straightfoward to implement, but for bigger sites some of these approaches can be difficult to adapt to an existing system structure.

In coming articles I will dive a little deeper into some of these subjects, and explore ways of implementing them on a larger scale.
