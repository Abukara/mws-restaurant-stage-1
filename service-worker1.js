importScripts('/js/idb.js');

//use of from https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js

let cache_name = 'precache-v1';


function startdb() {
  idb.open('restaurant', 1, function (upgradeDB) {
    //create Db objectStore for restaurants
    upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
  })
}

self.addEventListener('activate', event => {
  event.waitUntil(
    startdb()
  )
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});


function addDB(values){

  idb.open('restaurant',1).then(function (db){
    var transaction = db.transaction('restaurants', 'readwrite');
    var store = transaction.objectStore('restaurants');
    return Promise.all(values.map(function (value){

      return store.put(value);

    })).then(function(e){

    }).catch(function(e){
      transaction.abort();
      console.log(e);
    })
  })
}

//orientation at https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
addEventListener('fetch', event => {
  event.respondWith(async function () {
    //checks for call to restaurant
    if (checkrestaurantid(event.request.url)) {


      return idb.open('restaurant', 1).then(function(db){
        var transaction = db.transaction('restaurants', 'readonly');
        var store = transaction.objectStore('restaurants');

        // Return items from database
        return store.getAll();
      }).then((dbdata) => {

      //checks for length of indexdb if its empty load data into database
        if (!dbdata.length) {

          // returns  data from network
          return fetch(event.request.url)
            .then((responseUrl) => {

              // return response;
              return responseUrl.json()
                .then(function (values) {

                  // Adds data to database
                  addDB(values);

                  console.log("Saving to DB");
                  var init = {
                    status: 200,
                    statusText: "OK",
                    headers: {'Content-Type': 'application/json'}
                  };

                  const fetchResponse = new Response(JSON.stringify(values), init);
                  return fetchResponse;
                })
              })
            }else{
              var init = {
                status: 200,
                statusText: "OK",
                headers: {'Content-Type': 'application/json'}
              };
              // stringify Json to keep it in db.
              const indexDBResponse = new Response(JSON.stringify(dbdata), init);
              return indexDBResponse;
            }
          })

          }else{
      // Try to get the response from a cache.
      var cachedResponse = await caches.match(event.request);

      // Return it the response if one is foun.
      if (cachedResponse) {

        return cachedResponse;
      }
      // If there was no match in the cache the network will be used.

      return fetch(event.request)
        .then(function (cachedResponse) {

          return caches.open(cache_name).then(function (cache) {
            // try to not cache google maps
            if (event.request.url.indexOf('maps') < 0) {
              cache.put(event.request.url, cachedResponse.clone());
            }
            return cachedResponse;
          });
        });
    }
  }());
});
//checks restaurant id so restaurants can get cached and later be stored in idb.
function checkrestaurantid(url){
  var serverurl = /^http:\/\/localhost:1337\/restaurants$/;
  var serverUrlMatch = url.match(serverurl);
  if(serverUrlMatch)
    return 1;
  return 0;
}

self.addEventListener('activate', function (event) {
  console.log('Activating new service worker...');
//Remove old and unwanted caches
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
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
