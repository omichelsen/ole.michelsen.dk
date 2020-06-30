---
title: Setup Apache and PHP on macOS
description: How to setup a local web server on macOS Catalina using Apache and PHP.
date: 2020-05-26
# tags: ["apache", "macos", "php"]
---

This is how to quickly get a local web development server up and running on your macOS Catalina. Since Apache and PHP are already preinstalled, you only need to run a few commands in the Terminal and edit a couple of config files. This will enable you to have multiple websites running on your machine using any virtual domain names you like.

<!-- more-->

I have listed all the changes as Terminal commands so you can easily add them to a script if you like.

_Note: all these commands require admin level access and will have to be invoked with [sudo](https://linuxacademy.com/blog/linux/linux-commands-for-beginners-sudo/)._


## Local domain name

First we pick which domain name we'd like to make a website for. You can make up anything, even existing ones, but this would prevent you from visiting them online, so better choose something homemade:

```shell
grep -qxF '127.0.0.1 dev.mydomain.com' /etc/hosts || echo '127.0.0.1 dev.mydomain.com' | sudo tee -a /etc/hosts
```

The line above appends `127.0.0.1 dev.mydomain.com` to the `/etc/hosts` file if it doesn't already exist. Now this domain name will point to your local machine!

We are using the utility `tee` to make things play nice with `sudo`. The grep flags are:

- `-q` be quiet
- `-x` match the whole line
- `-F` pattern is a plain string


## Apache and PHP

Everything you need should already be installed with macOS Catalina, we just need to enable PHP and the virtual hosts in the Apache config:

```shell
sudo sed -i '' 's,#\(Include.*httpd-vhosts.conf\),\1,' /etc/apache2/httpd.conf
sudo sed -i '' 's,#\(LoadModule rewrite_module.*\),\1,' /etc/apache2/httpd.conf
sudo sed -i '' 's,#\(LoadModule php7_module.*\),\1,' /etc/apache2/httpd.conf
```

Now your config file `/etc/apache2/httpd.conf` should look something like this:

<img src="/images/blog/apache-php-web-server-macos-catalina/httpd.png" alt="Apache config file" srcset="/images/blog/apache-php-web-server-macos-catalina/httpd-2x.png 2x" width="860" height="415">


### Virtual hosts

We configure Apache to serve our virtual hosts in the file `/etc/apache2/extra/httpd-vhosts.conf`. It should already have some examples and you can edit/add your own:

```apacheconf
<VirtualHost *:80>
    ServerName dev.mydomain.com
    ServerAdmin admin@mydomain.com
    DocumentRoot "/Users/me/mydomain/public"
    ErrorLog "/Users/me/mydomain/error.log"
    CustomLog "/Users/me/mydomain/access.log" common
    <Directory "/Users/me/mydomain/public">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

This will serve dev.mydomain.com on port 80 (default) from the folder `/Users/me/mydomain/public`. The `<Directory>` instruction configures folder permissions necessary in the latest macOS versions.

In case you want to script this, you can replace the config with a symlink to your own config:

```shell
# make a backup of the file to "httpd-vhosts.conf.bak"
sudo cp /etc/apache2/extra/httpd-vhosts.conf /etc/apache2/extra/httpd-vhosts.conf.bak

# create a symlink to your own version of the file (e.g. from Dropbox)
sudo ln -sf ~/myconfigs/httpd-vhosts.conf /etc/apache2/extra/httpd-vhosts.conf
```

You should substitute the correct paths to your website and config of course.

## Restart

After you have completed these configuration steps, you just need to (re)start Apache for the changes to take effect:

```shell
sudo apachectl restart
```

You can add as many local virtual websites as you'd like, and you could put all these instructions in a setup script if you find yourself switching computers often.
