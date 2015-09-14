This is a hands on introduction to [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), looking at how you can build an offline capable web app. For the vast majority of use cases, web apps have the potential to be every bit as powerful as a native app. An important piece of the puzzle, is handling caching and updating of the resources that the app needs, so your app will work well on flaky connections and offline.

This example will be based on a web app I made a while ago, a currency convertion app called [Kuranz](https://app.kuranz.com/). The point of the app was to use GPS to determine the curreny of the country you were in, and above all to work offline in countries where data roaming was expensive or even impossible.

<!-- more-->

## Intro to Service Workers

If you don't quite know what a Service Worker is, here's the elevator pitch: a Service Worker is a script that runs in the background and can control the page it's loaded by. In this script you can intercept, modify and cache requests made by the page. Everything runs in a separate process and is designed to be async, so it won't block the UI, but you also have no access to the <abbr title="Document Object Model">DOM</abbr>. For quite sensible reasons, service workers only run over HTTPS.

## Install your Service Worker

We'll start off by actually loading our service worker (called `service-worker.js`) on the page. This snippet should be one of the first things in your app:

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(function () {
            if (navigator.serviceWorker.controller) {
                // If .controller is set, then this page is being actively controlled by the service worker.
                console.log('In control!');
            } else {
                // If .controller isn't set, then prompt the user to reload the page so that the service worker can take
                // control. Until that happens, the service worker's fetch handler won't be used.
                console.log('Please reload this page to allow the service worker to handle network operations.');
            }
        }).catch(function (error) {
            console.error(error);
        });
    }

## Offline First

Now we will create our `service-worker.js`. In order for our app to even load offline, we obviously need to make sure that essentials like the main app script and style sheet is cached. We can do this by explicitly listing the resources the app needs to function:

    var CACHE_VERSION = 'v1';

    this.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open(CACHE_VERSION).then(function (cache) {
                return cache.addAll([
                    'index.html',
                    'styles/app.css',
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


In the Kuranz app, the most important resources are the data for countries and currencies and the mapping thereof.

## Activate Service Worker

As soon as the service worker is successfully installed, the `activate` event will fire. This will happen every time your service worker starts, so it's a great time to do some house cleaning. Every time you update a file in your app, it should be cleared from the cache, so we will do this here:
    
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


## Cache then network

Besides the core files which we can permanently cache, our app also uses data that is updated regularly. Countries and currencies doesn't change that often, but the exchange rates change every two hours. Therefore need a special cache strategy for this data, where we will default to the cache so we can deliver a result as fast as possible, but also check for a newer version and update the cache.

<p class="c"><img alt="Cache then network handled by service worker" src="/images/blog/making-an-offline-webapp-with-service-workers/cache-then-network.png" srcset="/images/blog/making-an-offline-webapp-with-service-workers/cache-then-network-2x.png 2x" width="500" height="307"></p>
    
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

## Background Sync (future)

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

### Respond in the service worker

    this.addEventListener('periodicsync', function (event) {
        if (event.registration.tag == 'get-latest-news') {
            event.waitUntil(fetchAndCacheLatestNews());
        } else {
            // unknown sync, may be old, best to unregister
            event.registration.unregister();
        }
    });