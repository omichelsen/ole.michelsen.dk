---
title: Social sign in with single-page app and JWT server validation
description: How to do client-side social sign in with providers like Facebook, Google and Twitter, and validate the user with JWT when talking to the server.
date: 2016-01-24
# tags: ["api", "javascript", "node", "security", "social", "spa", "webserver"]
---

Social sign in is ubiquitous nowadays, and if you are running a Single-Page App (SPA), you can sign in without ever reloading the page. This will allow your app to talk to all the social networks like Facebook and Twitter, and you can access profile info, friends/contacts, photos and more, all without handling anything on your server.

However if you _do_ need to send some data to your server at some point, you need to ensure that the users posting to your server, are actually who they say they are. This tutorial will go through the sign in process in a SPA, and validating the access tokens we recieve on our own server. First let's look at how to create a simple sign in page.

<!-- more-->

## Client app and hello.js

To sign in with a social network provider actually turns out to be the easiest part. Using the great library [hello.js](https://adodson.com/hello.js/) you just have to sign up for a client key with the providers you wish to support (e.g. [Facebook](https://developers.facebook.com/apps)) and call `login()`.

```js
hello.init({
    facebook: FACEBOOK_CLIENT_ID,
    windows: WINDOWS_CLIENT_ID,
    google: GOOGLE_CLIENT_ID
}, {
    redirect_uri: 'redirect.html'
});
```

```html
<button onclick="hello('facebook').login()">Facebook</button>
```

This bit of code allows us to sign in with Facebook, and if you [check out the API](https://adodson.com/hello.js/#features) for hello.js, you can access most data from the providers you want to support.

## Authenticating with the server

But now we want to allow the user to save some data on our server. Since we have authenticated client-side with Facebook, we have an authentication token from Facebook. This is used to validate our session when talking to Facebook. We need to establish the same level of trust with our own server. This diagram shows the flow we are trying to achieve:

<p class="c">
    <img itemprop="image" src="/images/blog/social-signin-spa-jwt-server/token-authentication.png" alt="Token verification sequence diagram" width="537" height="491">
</p>

To secure communications between our client and server, we will first send the token to our server for verification. This snippet will POST the token to our own endpoint `/api/auth` using the small AJAX lib [superagent](https://visionmedia.github.io/superagent/):

```js
var socialToken;
var serverToken;

hello.on('auth.login', function (auth) {
    // Save the social token
    socialToken = auth.authResponse.access_token;

    // Auth with our own server using the social token
    authenticate(auth.network, socialToken).then(function (token) {
        serverToken = token;
    });
});

function authenticate(network, socialToken) {
    return new Promise(function (resolve, reject) {
        request
            .post('/api/auth')
            .send({
                network: network,
                socialToken: socialToken
            })
            .set('Accept', 'application/json')
            .end(function(err, res){
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
    });
}
```

### Validate social access tokens on the server

Now let's see how to handle it on the server side. I show the example as a simple node.js/Express app, but you can implement it in any server language you like (PHP, Ruby etc.). You can find this [example on Github](https://github.com/omichelsen/blog-social-signin-spa-jwt-server).

We want to verify with Facebook, that the token is valid and who the user is. To do this we just have to send the token to the Facebook API like this:

```js
app.post('/api/auth', function (req, res) {
    // Grab the social network and token
    var network = req.body.network;
    var socialToken = req.body.socialToken;

    // Validate the social token with Facebook
    validateWithProvider(network, socialToken).then(function (profile) {
        // Return the user data we got from Facebook
        res.send('Authenticated as: ' + profile.id);
    }).catch(function (err) {
        res.send('Failed!' + err.message);
    });
});
```

```js
var providers = {
    facebook: {
        url: 'https://graph.facebook.com/me'
    }
};

function validateWithProvider(network, socialToken) {
    return new Promise(function (resolve, reject) {
        // Send a GET request to Facebook with the token as query string
        request({
                url: providers[network].url,
                qs: {access_token: socialToken}
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(err);
                }
            }
        );
    });
}
```

## JSON Web Token

Now we have validated the authenticity of the user, we can give the client our own signed JSON Web Token (JWT) that contains the info of the authenticated user. This token needs to be sent along with all future requests, and our server can then validate the request simply by verifying the token signature. This way we don't have to validate the social network token with e.g. Facebook on every request.

So we will change our `/api/auth` endpoint to return a JWT instead. Here I'm using the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) lib, but check out [jwt.io](https://jwt.io/) for a library for your chosen server language.

```js
...
    // Validate the social token with Facebook
    validateWithProvider(network, socialToken).then(function (profile) {
        // Return a server signed JWT
        res.send(createJwt(profile));
    }).catch(function (err) {
        res.send('Failed!' + err.message);
    });
...
```

```js
function createJwt(profile) {
    return jwt.sign(profile, 'MY_PRIVATE_KEY', {
        expiresIn: '2h',
        issuer: 'MY_APP'
    });
}
```

We are returning a JWT signed with our own private key (you should never leak your private key to the client!), and containing the user profile data. It is important to implement the `expiresIn` value, as anybody with this JWT can make requests, so you will reduce the risk by forcing the user to do a new `/api/auth` request once in a while.

### Verify the JWT

Now we just need to send this JWT along with any other requests we do to the server, verify that the signature is valid, and we are good to go. This example shows another endpoint on the server, which will verify that the JWT is good before returning data:

```js
app.get('/secure', function (req, res) {
    var jwtString = req.query.jwt;

    try {
        var profile = verifyJwt(jwtString);
        res.send('You are good people: ' + profile.id);
    } catch (err) {
        res.send('Hey, you are not supposed to be here');
    }
});
```

```js
function verifyJwt(jwtString) {
    return jwt.verify(jwtString, 'MY_PRIVATE_KEY', {
        issuer: 'MY_APP'
    });
}
```

You can send the JWT to your server any way you like, normally you would put it in a header, but query string, POST data or cookie is also fine.

It is possible to append any data to the JWT when you generate it on your server, so this is also a very convenient way to send some additional user data to your client-side app. Just remember that a JWT can be decoded to clear text by anyone, so don't put confidential info in there. The safety of a JWT comes from the fact that it is signed, so it can't be modified. It is not encrypted.

In conclusion this is probably the easiest way to handle social sign in with a single-page app, and still securing your server/API with just a few lines of code. All the network providers I have been using supports this form of auth token verification, and from their documentation, these are the URL's you can send the token to:

- Facebook: [https://graph.facebook.com/me](https://graph.facebook.com/me)
- Github: [https://api.github.com/user](https://api.github.com/user)
- Google: [https://www.googleapis.com/oauth2/v3/tokeninfo](https://www.googleapis.com/oauth2/v3/tokeninfo)
- Windows: [https://apis.live.net/v5.0/me](https://apis.live.net/v5.0/me)

All of them accept the auth token as a query string in the form of `access_token=TOKEN`.

The code I have shown here is packaged as an [example project](https://github.com/omichelsen/blog-social-signin-spa-jwt-server) on Github.