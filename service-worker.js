self.addEventListener('install', function(event) {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open('restaurant-cache-v1')
    .then(function(cache) {
		console.log(cache);
      return cache.addAll(
	   [
    './style/styles.css',
	'./style/responsive.css',
    './images/1.jpg',
	'./images/2.jpg',
	'./images/3.jpg',
	'./images/4.jpg',
	'./images/5.jpg',
	'./images/6.jpg',
	'./images/7.jpg',
	'./images/8.jpg',
	'./images/9.jpg',
	'./images/10.jpg',
	'./index.html',
	'./restaurant.html',
	'./js/main.js',
	'./js/resurant_info.js',
	'./js/dbhelper.js',
	'./data/restaurants.json',
 
]
	  
	  
	  
	  );
    })
  );
});


self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)
	})
	);
});
