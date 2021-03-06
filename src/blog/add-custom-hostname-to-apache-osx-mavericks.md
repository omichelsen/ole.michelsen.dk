---
title: Add custom hostname to Apache on OSX 10.9 Mavericks
description: How to use a custom hostname/domain with your local Apache web server on OSX Mavericks using Virtual Hosts and Dropbox.
date: 2014-05-07
dateModified: 2014-11-25
tags:
  - blog
  - archive
# tags: ["apache", "bash", "macos", "terminal"]
---

<img class="entry-image" src="/images/blog/add-custom-hostname-to-apache-osx-mavericks/apache.svg" alt="Logo of the Apache Software Foundation" width="256" height="76"> I have previously blogged on how to [setup a local web server in Mavericks](/blog/setup-local-web-server-apache-php-macos-x-mavericks/), and use it to serve web sites directly from your Dropbox folders. This works very well for simple web sites, but if you are using a third party framework like the Facebook SDK, you might need to serve your sites from a specific hostname, e.g.: dev.mysite.com.

<!-- more-->

Normally your local Apache web server will serve your sites from a URL like this: `http://localhost/~user/mysite`. To make “mysite” run from `http://dev.mysite.com` instead, you need to setup Virtual Hosts in Apache, but fortunately this is quite easy, and you can still use Dropbox if you like.

## Setup Virtual Hosts

Edit your Apache configuration by entering the following in a Terminal:

`sudo nano /etc/apache2/httpd.conf`

Use <kbd>CTRL</kbd>+<kbd>W</kbd> to search for “vhosts” and uncomment the following line (remove the #):

`Include /private/etc/apache2/extra/httpd-vhosts.conf`

Press <kbd>CTRL</kbd>+<kbd>O</kbd> and then <kbd>CTRL</kbd>+<kbd>X</kbd> to save and exit. Now you can edit and add your own Virtual Hosts configuration:

`sudo nano /etc/apache2/extra/httpd-vhosts.conf`

At the end of this file, you need to add the configuration for your own Virtual Hosts. I have created an example here:

```apacheconf
<VirtualHost *:80>
    ServerName dev.mysite.com
    ServerAdmin admin@mysite.com
    DocumentRoot "/Users/myuser/Dropbox/Sites/mysite.com"
    ErrorLog "/Users/myuser/Dropbox/Sites/mysite.com-error.log"
    CustomLog "/Users/myuser/Dropbox/Sites/mysite.com-access.log" common
    <Directory "/Users/myuser/Dropbox/Sites/mysite.com">
        Options Indexes FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all
    </Directory>
</VirtualHost>
```

You can use this and modify to your own needs. The important elements are:

* `ServerName`: the hostname you would like your site to use, note that this domain doesn’t need to exist, you can make up anything you like!
* `DocumentRoot`: the folder of your site, e.g. a folder in Dropbox (drag and drop the folder into Terminal to get the full path)
* `<Directory>`: the same as DocumentRoot, here we allow for .htaccess to overwrite/customize Apache (whole section can be skipped if not needed)

__Update 2014-11-25__: If you are using OS X Yosemite, you need to change the last two lines in `<Directory>` to:

`Require all granted`

Press <kbd>CTRL</kbd>+<kbd>O</kbd> and then <kbd>CTRL</kbd>+<kbd>X</kbd> to save and exit. As always you have to restart Apache for the changes to kick in:

`sudo apachectl restart`

## Update your hosts file

Now we need to make the computer believe that our custom hostname dev.mysite.com actually exists, and point it to our local Apache web server. To do this we need to edit the hosts file:

`sudo nano /etc/hosts`

Add your custom hostname to the end of the file:

`127.0.0.1 dev.mysite.com`

The IP address in front is a special IP address that always points to your computer (localhost).

That’s all! Now you can open a browser, point it to `http://dev.mysite.com`, and it should load your local website.

You can add as many Virtual Hosts as you like in this way, and point them to any hostname of your choosing. Just remember to also create a record for the hostnames in the /etc/hosts file.

Also see my previous article for extra information on how to [setup Apache with PHP](/blog/setup-local-web-server-apache-php-macos-x-mavericks/) and serve files from Dropbox.
