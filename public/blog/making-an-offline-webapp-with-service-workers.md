This is a hands on introduction to [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), looking at how you can build an offline capable web app. For the vast majority of use cases, web apps have the potential to be every bit as powerful as a native app. An important piece of the puzzle, is handling caching and updating of the resources that the app needs, so it will work well offline and on flaky connections.

This example will be based on a web app I made a while ago, a currency convertion app called [Kuranz](https://kuranz.com/). The app is using GPS to determine the currency of the country you are in, and it works offline in countries where data roaming is expensive or even impossible.

<!-- more-->

## Intro to Service Workers

If you don't quite know what a service worker is, here's the elevator pitch: a service worker is a script that runs in the background and can control the page it's loaded by. In this script you can intercept, modify and cache requests made by the page. Everything runs in a separate process and is designed to be async, but you also have no access to the <abbr title="Document Object Model">DOM</abbr>. For quite sensible reasons, service workers only run over HTTPS.

## Install your Service Worker

We'll start off by actually loading our service worker (called `service-worker.js`) on the page. This snippet should be one of the first things in your app:

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').catch(function (error) {
            console.error(error);
        });
    }

The location of the script determines the scope of which pages you can control, so if you put it in a sub folder like `/scripts/service-worker.js`, you can only control pages in the folder `/scripts`.

## Offline First

Now we will create our `service-worker.js`. In order for our app to even load offline, we obviously need to make sure that essentials like the main app script and style sheet is cached, and in the case of the Kuranz app also the data for countries, currencies and rates. We can do this by explicitly listing the resources the app needs to function during the install phase:

    var CACHE_VERSION = 'v1';

    this.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open(CACHE_VERSION).then(function (cache) {
                return cache.addAll([
                    'index.html',
                    'styles/app.css',
                    'scripts/app.js',
                    'data/countries.json',
                    'data/countries_currencies.json',
                    'https://openexchangerates.org/api/currencies.json',
                    'https://openexchangerates.org/api/latest.json'
                ]).catch(function (error) {
                    console.error('Error in install handler:', error);
                });
            })
        );
    });

And now our app will load offline! If you notice the first line, we have given the cache a version name. If you update your app files and want to force the client to download a new version, you just have to update the version name. As you will see in the next section, it's important to also remove old caches, or you will swamp the users device with a lot of outdated files.

## Activate the service worker

As soon as the service worker is successfully installed, the `activate` event will fire. This will happen every time your service worker starts, so it's a great time to do some house cleaning. Every time you update your files and cache version, the old one should be cleared from the cache like this:

    this.addEventListener('activate', function (event) {
        event.waitUntil(
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (cacheName) {
                        if (cacheName !== CACHE_VERSION) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    });

## Cache with network fallback

Now we have handled the caching, comes the truly powerful part of service workers: the `fetch` event. This allows us to control exactly what happens when our app makes a request for a file.

Since we have cached all the necessary files in the install step, we want to serve files directly from the cache. This speeds up our app tremendously, as we don't have to wait for the network. But if our app needs a resource which we didn't cache up front (or if the cache got cleared by the browser), it's good to fall back to the network and do a normal request.

    this.addEventListener('fetch', function (event) {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    });

## Cache then network for frequently updated resources

Besides the core files which we can permanently cache, our app also uses data that is updated regularly. Countries and currencies doesn't change that often, but the exchange rates change every two hours. Therefore we need a special cache strategy for this data: we will default to the cache so we can deliver a result as fast as possible, but also check for a newer version and update the cache in the background.

<p class="c"><img alt="Cache then network handled by service worker" src="/images/blog/making-an-offline-webapp-with-service-workers/cache-then-network.png" srcset="/images/blog/making-an-offline-webapp-with-service-workers/cache-then-network-2x.png 2x" width="500" height="307"></p>

We do this by extending the `fetch` event handler, to check which resource we are getting. If the request is to [openexchangerates.org](https://openexchangerates.org/), we want to use our new cache strategy, otherwise we use our normal one:

    this.addEventListener('fetch', function (event) {
        var requestUrl = new URL(event.request.url);

        if (requestUrl.hostname === 'openexchangerates.org') {
            event.respondWith(
                caches.open(CACHE_VERSION).then(function (cache) {
                    return cache.match(event.request).then(function (response) {
                        if (response) {
                            fetchAndCache(event, cache);
                            return response;
                        } else {
                            return fetchAndCache(event, cache);
                        }
                    }).catch(function (error) {
                        console.error('  Error in fetch handler:', error);
                        throw error;
                    });
                })
            );
        } else {
            event.respondWith(
                caches.match(event.request).then(function (response) {
                    return response || fetch(event.request);
                })
            );
        }
    });

    function fetchAndCache(event, cache) {
        return fetch(event.request.clone()).then(function (response) {
            if (response.status < 400) {
                cache.put(event.request, response.clone());
            }
            return response;
        });
    }

Now when our app requests the currency rates, the data will be delivered immediately from the cache, and if there is network access, the cache will be updated with a new version in the background. However this means that our app will not get the updated rates until the page is refreshed. This is not optimal, but there are some options to improve this.

## Notify page of update with postMessage()

With `postMessage()` we can send messages between the service worker and the page. We can use this to notify the page, that an update has been downloaded:

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data.timestamp - currentTimestamp > 1000*60*60*4) {
                document.location.reload();
            }
        });
        navigator.serviceWorker.register('/service-worker.js').catch(function (error) {
            console.error(error);
        });
    }

In the service worker we send an update message when a new version have been downloaded (partial code from the `fetch` handler):

    ...
    if (response) {
        fetchAndCache(event, cache).then(sendUpdateNotification);
        return response;
    } else {
        return fetchAndCache(event, cache);
    }
    ...
    
    function sendUpdateNotification(response) {
        clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage({
                    type: 'UPDATE',
                    timestamp: Date.now()
                });
            });
        });
    }

The update message includes a timestamp, so we can compare and see if it is newer than `currentTimestamp` (assuming this variable contains the timestamp of the currently loaded data). This example just checks if it is newer than 4 hours, but you could use a more intelligent comparison method.

Now our app is completely ready to work even in spotty network conditions. Everything will be super fast and served from the chache, and we will still recieve updates to our data if there a newer version is available. The best thing is that our app can remain largely agnostic to the presence of the service worker. We do not have to change any existing code, or change the way we request the data, it will just be provided to us in the fastest way possible - even offline!

## Background Sync

An interesting supporting feature is in the works: [Background Sync](https://github.com/slightlyoff/BackgroundSync). This will potentially allow for us to schedule regular updates to parts of our cache, so we can show the latest news even though the user might not have refreshed the page recently. It is [not ready yet](https://jakearchibald.github.io/isserviceworkerready/#background-sync), but here's an example of the suggested syntax:

### Request it from the page

    navigator.serviceWorker.ready.then(function (registration) {
        registration.periodicSync.register({
            tag: 'get-latest-news', // default: ''
            minPeriod: 12 * 60 * 60 * 1000, // default: 0
            powerState: 'avoid-draining', // default: 'auto'
            networkState: 'avoid-cellular' // default: 'online'
        }).then(function (periodicSyncReg) {
            // success
        }, function () {
            // failure
        })
    });

### Respond in the Service Worker

    this.addEventListener('periodicsync', function (event) {
        if (event.registration.tag == 'get-latest-news') {
            event.waitUntil(fetchAndCacheLatestNews());
        } else {
            // unknown sync, may be old, best to unregister
            event.registration.unregister();
        }
    });