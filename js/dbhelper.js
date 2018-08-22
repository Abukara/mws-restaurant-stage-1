/**
 * Common database helper functions.
 */
class DBHelper {



  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static  Restaurant_ID_URL(id) {
    const port = 1337 // Change this to your server port
    url= `http://localhost:${port}/restaurants/${id}`;
  }
  static  Reviews_URL_ID(id) {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/?restaurant_id=${id}`;
  }
  static  Reviews_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/`;
  }
  static  Favorite_URL(favorite,rest_id) {
    const port = 1337 // Change this to your server port
    if(favorite==="yes"){
      return  `http://localhost:${port}/restaurants/${rest_id}/?is_favorite=true`;
    }else{
      return  `http://localhost:${port}/restaurants/${rest_id}/?is_favorite=false`;
    }

  }

static favoriteRestaurant(restaurant) {
  let mark;
  if(restaurant.is_favorite ==='true')
     mark =  "yes";
  else
     mark =  "no";
   
  return fetch(DBHelper.Favorite_URL(mark,restaurant.id),{method:'PUT',body:restaurant})
     .then(function (response) {
       if(response.ok) {
       return response.json();
       } else {
         console.log("response is wrong markFavorite");
       }
     });
    }

  /**
   * Fetch all restaurants. change from xhr to ajax fetch
   */
   static fetchRestaurants(callback) {
       fetch(DBHelper.DATABASE_URL)
         .then(response => {
           if (response.status === 200) {
             response.json()
               .then(json => {
                 callback(null, json)
               }).catch(error => {
                 callback(error, null)
               });
           } else {
             callback((`Request failed. Returned status of ${response.status}`), null);
           }
         }
       ).catch(error => callback(error, null));
     }
  /**
   * Fetch all reviews
   */
     static fetchReviewsByRestaurant(id){
       return fetch(DBHelper.Reviews_URL_ID(id))
         .then(response => {
           if (response.status === 200) {
             return response.json();
               } else {
             console.log(`Request failed. Returned status of ${response.status}`);
           }
         }
       );
     }



static postReviews(review) {
  return fetch(DBHelper.Reviews_URL(),{method:'post',body:review})
     .then(function (response) {
       if(response.status === 201) {
       return response.json();
       } else {
         console.log(`Request failed. Returned status of ${response.status}`);
       }
     });
    }



 //   Fetch a restaurant by its ID.
     static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }





  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`/restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL. removed .jpg to serve webp in index.html and restaurant.html
   * replace not found img with img nr. 10
   */
    static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph){
      return `/img/${restaurant.photograph}`
    }else{
      return (`/img/10`);
    }
    
  }
  /**
   *New Map marker for leaflet a restaurant. Still no working restaurant map for no apparent reason.
   */
   static mapMarkerForRestaurantleaf(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
