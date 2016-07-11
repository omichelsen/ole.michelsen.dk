It's often useful to peek at files directly from the Terminal, but wouldn't it be nice to have a little syntax highlighting as well? Thankfully MacOS Terminal supports 256 radiant colors, and with a little help from [GNU Source-highlight](http://www.gnu.org/software/src-highlite/source-highlight.html), we can set it up in no time. Firstly we install source-highlight using [Homebrew](http://brew.sh/):

<!-- more-->

`brew install source-highlight`

Then copy+paste the following into your [.bash_profile](http://www.joshstaiger.org/archives/2005/07/bash_profile_vs.html):

    LESSPIPE=`which src-hilite-lesspipe.sh`
    export LESSOPEN="| ${LESSPIPE} %s"
    export LESS=' -R -X -F '

This will make [less](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/less.1.html) automatically syntax highlight all the [supported file types](http://www.gnu.org/software/src-highlite/source-highlight.html#Supported-languages), e.g. HTML files: `less hello.html`

As you see we now have pretty syntax highlighting of our HTML file directly inside the Terminal!

<p>
    <img alt="Opening HTML file with less and syntax-highlight" src="/images/blog/syntax-highlight-files-macos-terminal-less/less.png" srcset="/images/blog/syntax-highlight-files-macos-terminal-less/less-2x.png 2x" width="509">
</p>

In the last line of our`.bash_profile` we're adding some switches to less, which you can modify to your liking:

* -R is needed for coloring, so leave that.
* -X will leave the text in your Terminal, so it doesn’t disappear when you exit less.
* -F will exit less if the output fits on one screen (so you don’t have to press “q”).

The last two are optional, so you can just remove them if you don’t want that behaviour.
