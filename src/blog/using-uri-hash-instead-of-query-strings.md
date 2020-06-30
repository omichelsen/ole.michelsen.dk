---
title: Using URI hash instead of query strings
description: Using URI location hash instead of query strings for bookmarkable JavaScript/AJAX pages with dynamic content.
date: 2011-06-17
# tags: ["ios", "ipad", "iphone"]
---

A URI hash is a great way to make JavaScript/AJAX pages with dynamic content bookmarkable. It can be used in a manner similar to query strings, but changes will not cause a new page request. This allows you to store data in the URI which can be read and changed by JavaScript without ever reloading the page.

<!-- more-->

For the uninitiated, a URI location hash is everything after the # sign in the URI:

`http://domain.com/page.html#i-am-a-hash`

A side note: URI hashes are not transferred back to the server, you can only access them client-side.

## Example: Countdown Clock

I have created an example of URI hashes in my [Countdown Clock](/tools/countdown/), which allows users to set a timer for a specific date with a message of their choice. By using a URI hash all these settings can be stored in the URI for bookmarking and sharing, while all configuration changes are made completely client-side. Doing the same thing with query strings would require the page to reload with every change.

### Original use of the URI hash

Note that the URI hash a.k.a location hash, is actually intended for jumping to named sections within the document. Therefore you should probably ensure not to use hash values that correspond to ID’s of existing HTML elements, or your browser will scroll down to that element.

<!-- *[URI]: Uniform Resource Identifier -->
