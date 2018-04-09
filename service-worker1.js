
const cache_name = 'precache-v1';

const urls_to_cache = ['css/styles.css',
'css/responsive.css',
'img/1.jpg',
'img/2.jpg',
'img/3.jpg',
'img/4.jpg',
'img/5.jpg',
'img/6.jpg',
'img/7.jpg',
'img/8.jpg',
'img/9.jpg',
'img/10.jpg',
'index.html',
'restaurant.html',
'js/main.js',
'js/restaurant_info.js',
'js/dbhelper.js',
'data/restaurants.json',
'https://maps.googleapi.com/js'

];

self.addEventListener('install', (event) => {
    console.info('Event: Install');

    event.waitUntil(
      caches.open(cache_name)
      .then((cache) => {
        //[] of files to cache & if any of the file not present `addAll` will fail
        return cache.addAll(urls_to_cache)
        .then(() => {
          console.info('All files are cached');
          return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
        })
        .catch((error) =>  {
          console.error('Failed to cache', error);
        })
      })
    );
  });


  self.addEventListener('fetch', (event) => {
  console.info('Event: Fetch');

  var request = event.request;

  //Tell the browser to wait for newtwork request and respond with below
  event.respondWith(
    //If request is already in cache, return it
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      //if request is not cached, add it to cache
      return fetch(request).then((response) => {
        var responseToCache = response.clone();
        caches.open(cache_name).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn(request.url + ': ' + err.message);
            });
          });

        return response;
      });
    })
  );
});

/*
  ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
*/

//Adding `activate` event listener
self.addEventListener('activate', (event) => {
  console.info('Event: Activate');

  //Remove old and unwanted caches
  event.waitUntil(
    caches.keys().then((cache_name) => {
      return Promise.all(
        cache_name.map((cache) => {
          if (cache !== cache_name) {     //cacheName = 'cache-v1'
            return caches.delete(cache); //Deleting the cache
          }
        })
      );
    })
  );
});
/*orientation at
https://github.com/GoogleChromeLabs/sw-toolbox/issues/227
*/
