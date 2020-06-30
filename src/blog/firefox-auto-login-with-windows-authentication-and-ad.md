---
title: Firefox auto login with Windows Authentication and AD
description: Get Firefox to login automatically on your intranet websites with Windows Authentication and Active Directory with a simple change in about:config.
date: 2011-08-07
# tags: ["ios", "ipad", "iphone"]
---

When creating intranet websites, Windows Authentication will take care of all your user identification needs. Both Internet Explorer and Chrome will automatically pass your NTLM (Active Directory) user credentials to the server, but Firefox will not and instead presents the user with an ugly login prompt. Fortunately it’s quite easy to enable this in Firefox with a simple configuration change.

<!-- more-->

Go to the address bar, and enter the following:

> about:config

You will be prompted with [a warning](/images/blog/firefox-auto-login-with-windows-authentication-and-ad/Firefox-Warranty-Warning.png), so just confirm that “I’ll be careful, I promise!”. Now go to the filter bar, and enter this string:

> network.automatic-ntlm-auth.trusted-uris

Double-click this value and add the domain of your intranet website, ex. “michelsen.dk”:

![Add intranet domain to the NTLM trusted list](/images/blog/firefox-auto-login-with-windows-authentication-and-ad/Firefox-NTLM-Config.png "Firefox NTLM Config")

You can add multiple domains to this list by separating them with a comma. Now you should be automatically logged in when you browse to your intranet website – given of course that you actually have permission ;-)
