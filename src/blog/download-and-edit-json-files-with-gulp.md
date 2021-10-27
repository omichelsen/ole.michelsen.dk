---
title: Download and edit JSON files with gulp
description: How to download JSON files, e.g. from REST services, and edit/format/manipulate them with gulp.
date: 2014-11-05
# tags: ["gulp", "javascript", "json"]
---

I often need to download some JSON data from a web service, extract the parts I need, and save it for use somewhere else. In this modern age of _JavaScript everywhere_, it's an obvious choice to do this with our favorite build system: [gulp](https://gulpjs.com/). But even though this is very easy to do, I couldn't find an explanation of how to put all the pieces together, so here goes.

<!-- more-->

## Setting it up

We are going to use some of the most popular gulp packages, so here's an easy one line install:

```bash
npm install gulp gulp-json-editor gulp-streamify request vinyl-source-stream
```

And let's start our `gulpfile.js` by loading them up:

```js
var gulp = require('gulp'),
    jeditor = require('gulp-json-editor'),
    request = require('request'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify');
```

## Downloading JSON from a web service

For this example I'm going to use GitHub's API to download a list of my own GitHub repositories. I already use this to create a [list on my own website](/).

The entire code looks as follows:

```js
gulp.task('github', function () {
    return request({
            url: 'https://api.github.com/users/omichelsen/repos',
            headers: {
                'User-Agent': 'request'
            }
        })
        .pipe(source('github.json'))
        .pipe(streamify(jeditor(function (repositories) {
            return repositories.map(function (repo) {
                return {
                    html_url: repo.html_url,
                    name: repo.name,
                    language: repo.language,
                    description: repo.description
                };
            });
        })))
        .pipe(gulp.dest('./'));
});
```

This will produce a file called `github.json` containing an array of my GitHub repositories:

```json
[{
    "html_url": "https://github.com/omichelsen/angular-steps",
    "name": "angular-steps",
    "language": "JavaScript",
    "description": "Split your UI into (wizard-like) steps in AngularJS."
}, … ]
```

So that was it! If you run `gulp github`, you should now have a `github.json` file in your folder, with a list of repositories. For a brief explanation of what's happening, read on.

### What's happening

In the first line we are making a simple HTTPS request to get the GitHub repositories. We send the additional `User-Agent` header, as this is required by GitHub (and generally best practice).

With [vinyl-source-stream](https://www.npmjs.org/package/vinyl-source-stream) we are converting the request stream to something gulp can use and naming it `github.json`:

```js
.pipe(source('github.json'))
```

In the penultimate `.pipe` line (hah), we are using [streamify](https://www.npmjs.org/package/gulp-streamify) to wrap the stream into something [json-editor](https://www.npmjs.org/package/gulp-json-editor) can use:

```js
.pipe(streamify(jeditor(function (repositories) { …
```

An then we can work on the JSON we got from GitHub, and pull out only the parts we need:

```js
return repositories.map(function (repo) {
    return {
        url: repo.html_url,
        name: repo.name,
        language: repo.language,
        description: repo.description
    };
});
```

Finally we save the modified JSON data to the root of our folder:

```js
.pipe(gulp.dest('./'));
```
