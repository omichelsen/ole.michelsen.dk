---
title: Setup local web server with Apache and PHP on MacOS X Mavericks
description: How to setup a local web server on MacOS X Mavericks with Apache and PHP and link projects directly from Dropbox to Apache.
date: 2013-12-30
dateModified: 2014-11-25
tags:
  - blog
  - archive
# tags: ["apache", "macos", "php"]
---

__Update 2014-11-25__: I have created an updated article on how to [setup Apache and PHP in OS X Yosemite](/blog/setup-local-web-server-apache-php-osx-yosemite/).

This a quick writeup of how to get a local web development server up and running on your Mac. Everything you need is preinstalled, and just needs to be configured. Some familiarity with the Terminal is presumed (e.g. how to start it).

After this tutorial you will have a working local Apache server with PHP, and I will show you how to create sub sites for each of your web projects directly from Dropbox.

<!-- more-->

## Apache

As I said everything you need should already be installed on your new Mavericks machine, so go ahead and and write the following in a Terminal window:

`httpd -v`

This will show you the installed version of Apache, which is Apache/2.2.24 on Mavericks. Start Apache with the following command:

`sudo apachectl start`

Now you can test that Apache is running by opening `http://localhost` in a browser. You should see the text “It works!”.

![Apache localhost works](/images/blog/setup-local-web-server-apache-php-macos-x-mavericks/apacheworks.png)

The document you are seeing is served from the system level web root, located in /Library/WebServer/Documents. We want to create a user level web root for our own projects, and we’ll do it all from the Terminal:

`mkdir ~/Sites`

Then we need to create a new user config for Apache (substitute your own user account short name):

`sudo nano /etc/apache2/users/username.conf`

Paste the following config into the Terminal editor:

```apacheconf
<Directory "/Users/username/Sites/">
  Options Indexes MultiViews FollowSymLinks
  AllowOverride All
  Order allow,deny
  Allow from all
</Directory>
```

Press <kbd>CTRL</kbd>+<kbd>O</kbd> and then <kbd>CTRL</kbd>+<kbd>X</kbd> to save and exit.

## PHP

Now we want to enable PHP, so you can actually develop something. Mavericks comes with PHP 5.4.17, so now we need to turn it on:

`sudo nano /etc/apache2/httpd.conf`

Use <kbd>CTRL</kbd>+<kbd>W</kbd> to search within nano and search for “php”. Uncomment the first line you find (remove the #):

`LoadModule php5_module libexec/apache2/libphp5.so`

Press <kbd>CTRL</kbd>+<kbd>O</kbd> and then <kbd>CTRL</kbd>+<kbd>X</kbd> to save and exit. Restart Apache for the change to kick in:

`sudo apachectl restart`

To test that PHP is now working, create a PHP test file in your new user level web root (~/Sites) with the following command:

`printf "<?php phpinfo(); ?>" > ~/Sites/phpinfo.php`

Test it by opening `http://localhost/~username/phpinfo.php` in a browser.

![PHP works](/images/blog/setup-local-web-server-apache-php-macos-x-mavericks/phpinfo.png)

## Run sites from Dropbox

Now we actually want to develop and test some websites locally, and if you are like me, they are all located in Dropbox. It would be quite a pain to copy the project to ~/Sites every time we make a change, so why not just create a reference to it?

Let’s say you have a web project in ~/Dropbox/Projects/MyWebsite, let’s create a symbolic link to it in our ~/Sites folder:

`ln -s ~/Dropbox/Projects/MyWebsite ~/Sites/MyWebsite`

We are not quite there yet though. Due to some probably quite reasonable security restrictions, we have to grant Apache access to read and serve files from this Dropbox folder. With the following we grant access to the entire Projects folder, but you can be more/less restrictive:

`chmod a+rx ~/Dropbox/Projects`

To test your site open `http://localhost/~username/MyWebsite` in a browser.

__Update 2014-04-16__: You might run into some permission issues with Dropbox. To fix this you have to use `chmod +x` on every folder in the path from user root. So if you have linked folder ~/Dropbox/MySites/SiteA, you have to use chmod on both ~/Dropbox, ~/Dropbox/MySites and ~/Dropbox/MySites/SiteA. And remember to do a restart of Apache after each change before you test.

This was just a quick tutorial to get your local development server up and running. If you think anything could be done easier or better in some way, please drop me a comment.

If you want to use custom hostnames for testing, check out my other article on how to [setup Apache with Virtual Hosts](/blog/add-custom-hostname-to-apache-osx-mavericks/).
