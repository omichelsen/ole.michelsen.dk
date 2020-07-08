---
title: Syntax highlight files in MacOS Terminal with less
description: Display files in Terminal using less and GNU source-highlight. Install with Homebrew and setup with only three lines in .bash_profile.
date: 2014-03-25
# tags: ["bash", "less", "macos", "terminal"]
---

It's often useful to peek at files directly from the Terminal, but wouldn't it be nice to have a little syntax highlighting as well? Thankfully MacOS Terminal supports 256 radiant colors, and with a little help from [GNU Source-highlight](http://www.gnu.org/software/src-highlite/source-highlight.html), we can set it up in no time. Firstly we install source-highlight using [Homebrew](https://brew.sh/):

<!-- more-->

```shell
brew install source-highlight
```

Then copy+paste the following into your [.bash_profile](http://www.joshstaiger.org/archives/2005/07/bash_profile_vs.html):

```shell
LESSPIPE=`which src-hilite-lesspipe.sh`
export LESSOPEN="| ${LESSPIPE} %s"
export LESS=' -R -X -F '
```

This will make [less](https://ss64.com/osx/less.html) automatically syntax highlight all the [supported file types](http://www.gnu.org/software/src-highlite/source-highlight.html#Supported-languages), e.g. HTML files: `less hello.html`

As you see we now have pretty syntax highlighting of our HTML file directly inside the Terminal!

<p>
  <picture>
    <source srcset="/images/blog/syntax-highlight-files-macos-terminal-less/less.webp, /images/blog/syntax-highlight-files-macos-terminal-less/less@2x.webp 2x" type="image/webp">
    <img
      alt="Opening HTML file with less and syntax-highlight"
      itemprop="image"
      src="/images/blog/syntax-highlight-files-macos-terminal-less/less.png"
      srcset="/images/blog/syntax-highlight-files-macos-terminal-less/less@2x.png 2x"
      width="509"
      height="354"
    >
  </picture>
</p>

In the last line of our`.bash_profile` we're adding some switches to less, which you can modify to your liking:

* -R is needed for coloring, so leave that.
* -X will leave the text in your Terminal, so it doesn’t disappear when you exit less.
* -F will exit less if the output fits on one screen (so you don’t have to press “q”).

The last two are optional, so you can just remove them if you don’t want that behaviour.
