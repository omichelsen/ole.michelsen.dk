---
title: Syntax highlight files in macOS Terminal with less
description: Display files in Terminal using less and GNU source-highlight. Install with Homebrew and setup with only three lines in .zshrc.
date: 2014-03-25
dateModified: 2020-12-30
# tags: ["bash", "less", "macos", "terminal"]
---

It's often useful to peek at files directly from the Terminal, but wouldn't it be nice to have a little syntax highlighting as well? Thankfully macOS Terminal supports 256 radiant colors, and with a little help from [GNU Source-highlight](https://www.gnu.org/software/src-highlite/source-highlight.html), we can set it up in no time. Firstly we install source-highlight using [Homebrew](https://brew.sh/):

<!-- more-->

```shell
brew install source-highlight
```

Then copy+paste the following into your [.zshrc](https://unix.stackexchange.com/questions/71253/what-should-shouldnt-go-in-zshenv-zshrc-zlogin-zprofile-zlogout):

```shell
LESSPIPE=`which src-hilite-lesspipe.sh`
export LESSOPEN="| ${LESSPIPE} %s"
export LESS=' -R -X -F '
```

This will make [less](https://ss64.com/osx/less.html) automatically syntax highlight all the [supported file types](https://www.gnu.org/software/src-highlite/source-highlight.html#Supported-languages), e.g. HTML files: `less hello.html`

As you see we now have pretty syntax highlighting of our HTML file directly inside the Terminal!

<p>
  <picture>
    <source srcset="/images/blog/syntax-highlight-files-macos-terminal-less/terminal.webp, /images/blog/syntax-highlight-files-macos-terminal-less/terminal@2x.webp 2x" type="image/webp">
    <img
      alt="Printing HTML file with less and syntax-highlight in the Terminal"
      itemprop="image"
      src="/images/blog/syntax-highlight-files-macos-terminal-less/terminal.png"
      srcset="/images/blog/syntax-highlight-files-macos-terminal-less/terminal@2x.png 2x"
      width="647"
      height="301"
    >
  </picture>
</p>

In the last line of our`.zshrc` we're adding some switches to less, which you can modify to your liking:

* -R is needed for coloring, so leave that.
* -X will leave the text in your Terminal, so it doesn’t disappear when you exit less.
* -F will exit less if the output fits on one screen (so you don’t have to press “q”).

The last two are optional, so you can just remove them if you don’t want that behaviour.
