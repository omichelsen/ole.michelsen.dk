So you love using [Harp](http://harpjs.com/), but you hate refreshing the browser every time you've made a change? [BrowserSync](http://www.browsersync.io/) to the rescue!

The good guys at Harp are working on building this into the platform, but until then it's actually very easy to do yourself. You just need [npm](https://www.npmjs.org/) and to enter a single command in the Terminal.

<!-- more-->

First we need to install BrowserSync with npm:

    npm install -g browser-sync

Now we just have to run the Harp server, and then start BrowserSync as proxy in front of it:

    harp server & 
    browser-sync start --proxy 'localhost:9000' --files 'public/**/*.jade, public/**/*.md, public/**/*.less'

As you can see, we are now watching for changes to the jade, markdown and less files in our `public` folder, and BrowserSync will automatically refresh your browser when any of these files change.

## Bash script

It can be a bit difficult to remember that long command, so let's create a small batch script to do this. In the root of your project folder create a file called `browsersync`, and paste the following into that file:

    #!/bin/bash
    harp server &
    browser-sync start --proxy 'localhost:9000' --files 'public/**/*.jade, public/**/*.md, public/**/*.less'

Then we need to make that file executable:

    chmod +x browsersync

And now we can run it:

    ./browsersync

Enjoy the stress free world of coding with automatic browser updates.
