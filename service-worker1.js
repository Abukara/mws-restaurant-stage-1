importScripts('/js/idb-min.js');

//use of  https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js

var urlsToCache = [
  '/', '/index.html',
  '/favicon.ico',
  '/restaurant.html',
  '/css/styles.css',
  '/js/idb-min.js',
  '/js/dbhelper.js',  
  '/js/main.js',
  '/js/restaurant-info.js',
  '/manifest.json'
]; 
let cache_name = 'precache-v1';
const serveraddress = 'localhost:1337';


self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(cache_name)
      .then(function (cache) {
        console.log('Opened cache');
        // Add Urls to cache
        return cache.addAll(urlsToCache)
        .then(function () {
          console.log('All resources have been fetched and cached.');
        }).catch(function () {
          console.log('Faild to cache resource');
        });
      })
  )
});

//orientation at https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://developers.google.com/web/fundamentals/primers/service-workers/
self.addEventListener('fetch', (event) => {
  //event.respondWith(async function () {
   
    var requestURL = new URL(event.request.url);
    //checks call to file

    const call = requestURL.pathname.split('/');
    console.log("pathname: "+requestURL.pathname);
    console.log("call "+call);
  if (requestURL.host === serveraddress) {
    //call to waiting_reviews
    fetchWaitingReviews();
        //clone of request -> request is a Stream.
    const evRequest = event.request.clone();

    return event.respondWith(fetch(evRequest).then(function (data) {
      if (data) {
        var respo = data.clone();
        if (requestURL.pathname.indexOf('restaurants') === 1) {
          DataToDB(respo.json(), 'restaurants');
        } else if (requestURL.pathname.indexOf('reviews') === 1) {
          DataToDB(respo.json(), 'reviews');
        }
        return data;
      }
    }).catch(function (e) {
      console.log(`Could not find url :${requestURL} from the network`);
      if (event.request.method === 'POST') {
        event.request.clone().text().then((body)=>{
          DataToDB(Promise.resolve(JSON.parse(body)), 'waiting_reviews');
        })
        }
        //added method to make it more visible
      return  getRestaurant(call, requestURL.pathname, requestURL.search);
    }));
    return;
  }
 //End of Caching Data
  if (requestURL.origin === location.origin) {
    return event.respondWith(
      caches.match(event.request)
        .then(function (cachedResponse) {
          // Cache hit - return cachedResponse
          if (cachedResponse) {
            return cachedResponse;
          }
          // IMPORTANT: Clone the request.
          var fetchRequest = event.request.clone();
          return fetch(fetchRequest).then(
            function (cachedResponse) {
              // Check for a valid response
              if (!cachedResponse || cachedResponse.status !== 200 || cachedResponse.type !== 'basic') {
                return cachedResponse;
              }
              // IMPORTANT: Clone the response. A response is a stream;
              var responseToCache = cachedResponse.clone();
              caches.open(cache_name)
                .then(function (cache) {
                  cache.put(event.request, responseToCache);
                });
              return cachedResponse;
            }
          ).catch(function (error) { console.log(`error : ${url}`); return new Response('error'); })
        }).catch(function (error) { console.log(`error : ${url}`); return new Response('error'); })
    );
  }
});

self.addEventListener('activate', function (event) {
  // Create IDB
  createDB();
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheNames.indexOf(cache_name) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

function createDB() {
  idb.open('restaurant', 1, function (upgradeDB) {
    //create Db objectStore for restaurants
    const restaurants = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    //create Db objectStore for reviews
    const reviews = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
    //create Db objectStore for waiting_reviews
    const waiting_reviews = upgradeDB.createObjectStore('waiting_reviews', {keyPath: 'id',
      autoIncrement:true });
  });
}

//created to have less redudant code
function openidb(){
  //check if service worker & idb exist
  if(!navigator.serviceWorker && !idb){
    console.log("service worker & idb not available")
  }
  return idb.open('restaurant',1);
}

//put data into indexed DB
function DataToDB(data, type) {
  data.then(function (response) {
    const opendb = self.openidb();
    //check if db is opened
    if (!opendb)
      return;
    opendb.then(db => {
      const transaction = db.transaction(type, 'readwrite');
      try {
        //check for lenght of response and if even a response is there
        if (response && response.length > 0) {
          response.forEach(value => {
            transaction.objectStore(type).put(value);
          });
        } else {
          transaction.objectStore(type).put(response);
        }
      } catch (error) {
        console.log(error);
      }
      return transaction.complete;
    });
  });
}

function getRestaurant(param, pathname, search) {
  const openidb = self.openidb();
  if (pathname.indexOf('restaurants') === 1) {
    if (param && param.length > 0) {

      const id = param[2];
      console.log("Param: "+param+" id: "+id);
      return   openidb.then(db => {
    return db.transaction('restaurants').objectStore('restaurants').get(parseInt(id)); }).then(function (response) {
    return response;}).then(function (res) {
        var init = {
          status: 200,
                    statusText: "OK",
                    headers: {'Content-Type': 'application/json'}
        };
        return new Response(JSON.stringify(res), init);
      });
    }
    else {
      return  openidb.then(db => {
    return db.transaction('restaurants').objectStore('restaurants').getAll(); }).then(function (response) {
    return response;}).then(function (res) {
        var init = {
          status: 200,
                    statusText: "OK",
                    headers: {'Content-Type': 'application/json'}
        };
        return new Response(JSON.stringify(res), init);
      });
    }
  } else if (pathname.indexOf('reviews') === 1) {
    console.log('reviews');
    var id = search.split('=');
    
    if (id) {
      return  opendb.then(db => {
    return db.transaction('reviews')
      .objectStore('reviews').getAll();
  }).then(function (response) {
    return response.filter(r=> r.restaurant_id==parseInt(id[1]));
  }).then(function (res) {
        var init = {
          status: 200,
                    statusText: "OK",
                    headers: {'Content-Type': 'application/json'}
        };
        return new Response(JSON.stringify(res),init);
      });
    }
  }
}






function fetchWaitingReviews() {
  if(navigator.onLine){
  const opendb = self.openidb();
  //check if db is opened
  if(!opendb)
    return;
  return opendb.then(function (db) {
    return db.transaction('waiting_reviews').objectStore('waiting_reviews').getAll();
    }).then(function (reviews) {
      reviews.forEach(function(review){
        fetch('http://localhost:1337/reviews', {
          method: 'POST',
          body: JSON.stringify(review),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(function(){
          if(!opendb)
            return;
          return opendb.then(db => {
      return db.transaction('waiting_reviews','readwrite')
        .objectStore('waiting_reviews').clear();
    });
        });
        });
      });
  }
  }
