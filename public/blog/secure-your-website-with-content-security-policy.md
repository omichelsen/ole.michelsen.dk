<img class="floatleft" src="/images/blog/secure-your-website-with-content-security-policy/CSP_Shield_Logo.png" src="/images/blog/secure-your-website-with-content-security-policy/CSP_Shield_Logo-2x.png 2x" alt="Content security policy shield" width="250" height="250"> So what is a content security policy (CSP), and why do I need one? A CSP is a contract that your server sends to the browser, defining from which domains it's ok to load scripts, style sheets, images etc.

This is an important tool to protect against [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) (XSS) and other maladies of the internet today. XSS can be used by evildoers to place a script into your website, which for example could replace the login field in your online bank, so usernames and passwords are sent to somebody else. Another trick could be to load your page in an iframe on a similar domain, so it looks like your page loads normally, all the while evil hackers are snatching up passwords and credit card information.

These techniques can be virtually undetectable to the user, as everything will look normal, and since these attacks happens on the client side, it doesn't matter how secure your server setup is once the damage is done.

This sounds terrible! How do I protect my users?? Content Security Policy to the rescue!

<!-- more-->

## Headers

The good news is that it's really easy to protect your website with CSP, you only have to add a single line to your server configuration. If you already know about CSP, you can use [my CSP config generator](/tools/csp.html) to create a configuration for your webserver.

If you are running Apache, you just need to add this single line to your `.htaccess` configuration file:

    Headers set Content-Security-Policy "default-src 'self'"

This line will configure your website to only load scripts, images etc. from it's own domain. This is a little limiting though, especially if you are running scripts from third parties like Google Analytics and CloudFlare. In that case your config should probably look more like this (line breaks added for readability):

    Headers set Content-Security-Policy "
        default-src 'self';
        script-src 'self' www.google-analytics.com *.cloudflare.com;
        img-src *.cloudflare.com
    "

You can set a policy for most types of resources a website can load, from scripts to images, style sheets and fonts. If you don't specifically define a header like `script-src` for scripts, the website will fallback to `default-src`.

### Supported directives

* __default-src__: Define loading policy for all resources type in case of a resource type dedicated directive is not defined (fallback)
* __script-src__: Define which scripts the protected resource can execute
* __object-src__: Define from where the protected resource can load plugins
* __style-src__: Define which styles (CSS) the user applies to the protected resource
* __img-src__: Define from where the protected resource can load images
* __media-src__: Define from where the protected resource can load video and audio
* __frame-src__: Define from where the protected resource can embed frames
* __font-src__: Define from where the protected resource can load fonts
* __connect-src__: Define which URIs the protected resource can load using script interfaces
* __report-uri__: Specifies a URI to which the user agent sends reports about policy violation
* __sandbox__: Specifies an HTML sandbox policy that the user agent applies to the protected resource

#### New in CSP2

CSP version 2 introduces some new directives. You should [check out browser support](http://caniuse.com/#feat=contentsecuritypolicy2) first though, as it's kind of spotty right now.

* __form-action__: Define which URIs can be used as the action of HTML form elements
* __frame-ancestors__: Indicates whether the user agent should allow embedding the resource using a frame, iframe, object, embed or applet element, or equivalent functionality in non-HTML resources (replaces __frame-src__)
* __plugin-types__: Define the set of plugins that can be invoked by the protected resource by limiting the types of resources that can be embedded
* __base-uri__: Restricts the URLs that can be used to specify the document base URL 
* __child-src__: Governs the creation of nested browsing contexts as well as Worker execution contexts

### Keywords

Each directive accepts domain patterns seperated by space, and domain patterns can contain both protocol and ports if you want to be specific: `http://*.mysite.com:8080`. Besides domain patterns there are some [special keywords](https://developer.mozilla.org/en-US/docs/Web/Security/CSP/CSP_policy_directives#Keywords) you can use:

* __'none'__: Nothing is allowed.
* __'self'__: Allow resources to load from the websites own (origin) domain.
* __'unsafe-inline'__: Allows inline `<script>` and `<style>` elements. This can be further secured by [specifying a hash](https://www.owasp.org/index.php/Content_Security_Policy_Cheat_Sheet#Refactoring_inline_code) of the code.
* __'unsafe-eval'__: Allows use of `eval()` in scripts. Needed for Angular.
* __https__: Forces all resources to be loaded over HTTPS.
* __data:__ Allows resources to be inlined with base64.

## Additional important headers

There are a few extra headers that are worth setting while you're at it.

### Strict-Transport-Security

Ensures that all traffic is sent [through HTTPS](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security).

    Header set Strict-Transport-Security "max-age=631138519; includeSubDomains"

### X-Frame-Options

Disallow your page to be [embedded](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options) within a `<frame>`, `<iframe>` or `<object>`.

    Header set X-Frame-Options DENY

### X-Content-Type-Options

Disable MIME type sniffing, which can e.g. make IE execute an innocent looking `.img` URL as a javascript.

    Header set X-Content-Type-Options nosniff

## Apache, nginx and IIS example

Setting these headers is very easy, and following is an example configuration for each of the major webservers. If you prefer, I have also created a [CSP generator tool](/tools/csp.html), which allows you to create a CSP for all the mentioned webservers, as well as load an existing configuration file to edit.

### Apache

    <IfModule mod_headers.c>
        Header set Content-Security-Policy "default-src 'self'; img-src *.cloudflare.com; script-src 'self' www.google-analytics.com *.cloudflare.com"
        Header set X-Content-Type-Options nosniff
        Header set X-Frame-Options DENY
    </IfModule>

### nginx

    add_header Content-Security-Policy "default-src 'self'; img-src *.cloudflare.com; script-src 'self' www.google-analytics.com *.cloudflare.com"
    add_header X-Content-Type-Options nosniff
    add_header X-Frame-Options DENY

### IIS

    <configuration>
       <system.webServer>
          <httpProtocol>
             <customHeaders>
                <add name="Content-Security-Policy" value="default-src 'self'; script-src 'self' www.google-analytics.com *.cloudflare.com; img-src *.cloudflare.com" />
                <add name="X-Content-Type-Options" value="nosniff" />
                <add name="X-Frame-Options" value="DENY" />
             </customHeaders>
          </httpProtocol>
       </system.webServer>
    </configuration>
