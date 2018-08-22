let restaurant;
let reviews;
var map;



/**
 * Initialize Google map, called from HTML.
 
  */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    const test = document.getElementById('map');
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(test, {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
        
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      }
  });
}



const toggleMap = () => {
    if (document.getElementById('map-container').style.display === 'block')
      document.getElementById('map-container').style.display = 'none'
    else
      document.getElementById('map-container').style.display = 'block'

  }

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL ()  {
  if (self.restaurant) { // restaurant already fetched!
    return Promise.resolve(self.restaurant);
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
   return DBHelper.fetchRestaurantById(id, (error, restaurant) => {
    if(!restaurant){
      console.error(error);
      return Promise.reject('No restaurant data');
    }
      self.restaurant = restaurant;
      fillRestaurantHTML();
      fillBreadcrumb();
     // callback(null, restaurant)
     return Promise.resolve(self.restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  
  const favbutton = document.getElementById('favorite-btn');
  //check if restaurant is favorite 
  if(restaurant.is_favorite==='true') {
        favbutton.setAttribute("aria-label","favorite-button");
    favbutton.setAttribute("class","favorite");
    
  } else {
    favbutton.setAttribute("aria-label","unfavorite-button");
    favbutton.setAttribute("class","unfavorite");
      
  }
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazyload';
  const imagesrc = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('src', imagesrc +'-webp.webp');
  image.setAttribute('data-src', imagesrc +'-webp.webp');
  image.setAttribute("alt",'Image of '+restaurant.name);
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  reviewForm(restaurant);
  fillReviewsHTML();
}

/**
* favorite a restaurant
*/
favoriteRestaurant = (element) => {
  //if restaurant is favorite
  if(self.is_favorite ==='true') {
  //remove favorite class from restaurant 
  element.classList.remove('favorite');
  // add unfavorite to restaurant
  element.classList.add('unfavorite');
  //remove old aria-label from unfavorite button
  element.removeAttribute('aria-label');
  //adding aria label  for favorite button to improve accesibility
  element.setAttribute('aria-label','favorite button');
  self.is_favorite ='false';
  } else {
  self.is_favorite ='true';
  //remove unfavorite class from restaurant
  element.classList.remove('unfavorite');
  //add favorite class from restaurant 
  element.classList.add('favorite');
  //remove old aria-label from favorite button
  element.removeAttribute('aria-label');
  //adding aria label  for unfavorite button to improve accesibility
  element.setAttribute('aria-label','unfavorite button');
}
//call to DBHelper favoriteRestaurant
DBHelper.favoriteRestaurant(self.restaurant);
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
}

function reviewForm (restaurant){
  //select review-form container
  const container = document.getElementById('review-form');
  //create form element inside
  const form = document.createElement('form');
  form.setAttribute('id','reviewForm123');
  form.setAttribute('class','testsync');
  // form.setAttribute('onsubmit','addReview(this);')
  container.appendChild(form);
  //field header name
  const headerblock = document.createElement("h2");
  headerblock.innerHTML = `Review ${restaurant.name}`;
  form.appendChild(headerblock);
  //create label for Reviewer Name
  const labelname = document.createElement('label')
  labelname.innerHTML= 'Reviewer Name:';
  labelname.setAttribute("for","Name");
  //create input field for Reviewer Name
  const inputName = document.createElement('input');
  inputName.setAttribute("type","text");
  inputName.setAttribute("name","Name");
  inputName.setAttribute("id","Name");
  inputName.setAttribute("placeholder","Review Name");
  inputName.setAttribute("required","");
  form.appendChild(labelname);
  form.appendChild(inputName);
  //label for Review rating
  const labelrating = document.createElement('label')
  labelrating.innerHTML='Rating';
  labelrating.setAttribute("for","rating");
  //dropdown rating 1 - 5
  const rating = document.createElement('select');
  rating.setAttribute("name","rating");
  rating.setAttribute("id","rating");
  rating.setAttribute("required","");
  //adding dropdown options from 1 - 5
  const option_1 = document.createElement('option')
  option_1.innerHTML="1";
  option_1.setAttribute("value","1");
  const option_2 = document.createElement('option')
  option_2.innerHTML="2";
  option_2.setAttribute("value","2");
  const option_3 = document.createElement('option')
  option_3.innerHTML="3";
  option_3.setAttribute("value","3");
  const option_4 = document.createElement('option')
  option_4.innerHTML="4";
  option_4.setAttribute("value","4");
  const option_5 = document.createElement('option')
  option_5.innerHTML="5";
  option_5.setAttribute("value","5");
  rating.appendChild(option_1);
  rating.appendChild(option_2);
  rating.appendChild(option_3);
  rating.appendChild(option_4);
  rating.appendChild(option_5);
  form.appendChild(labelrating);
  form.appendChild(rating);
  //label for comment field
  const labeltext = document.createElement('label')
  labeltext.innerHTML='Review Text:'
  labeltext.setAttribute("for","reviewText1");
  //comment for review
 const reviewText = document.createElement("textarea");
 reviewText.setAttribute("rows","4");
 reviewText.setAttribute("cols","50");
 reviewText.setAttribute("form","reviewForm123");
 reviewText.setAttribute("id","reviewText1");
 reviewText.setAttribute("name","reviewTe");
  reviewText.setAttribute("placeholder","Review Text");
  //review button
  const button = document.createElement("input");
  button.innerHTML="Add review";
  button.setAttribute("type","button");
  button.setAttribute("id","synctest");
  button.setAttribute("value","Add Review");
  button.setAttribute("form","reviewForm123");
  button.setAttribute("name","Name");
  button.addEventListener('click',appendReview);
  const message = document.createElement('div')
  message.innerHTML='';
  message.setAttribute('id','message_container');
  form.appendChild(labeltext);
  form.appendChild(reviewText);
  form.appendChild(button);
  form.appendChild(message);
} 

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  //if no reviews there than call to reviews by restaurant
  if (!reviews) {
    DBHelper.fetchReviewsByRestaurant(self.restaurant.id).then(function(response){
        self.reviews =response;
        fillReviewsHTML();
      });
    }
  const container = document.getElementById('reviews-container');
  container.innerHTML= '';
  const Review_title = document.createElement('h2')
  Review_title.innerHTML='Reviews';
  container.appendChild(Review_title);
  const ul = document.createElement('ul')
  ul.innerHtml= null;
  ul.id='reviews-list';
  if (!reviews){
    const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      self.initMap();
      return;
  }
 reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
  }

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.setAttribute("class","restraurant-reviewer-name");
  li.appendChild(name);
  const date = document.createElement('p');
  //toUTC string to convert date number to formated Date
  date.innerHTML = new Date(review.createdAt).toUTCString().slice(0,16);
 // date.innerHTML = review.date;
  date.setAttribute("class","date-of-creation")
  li.appendChild(date);
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("class","review-rating")
  li.appendChild(rating);
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function appendReview(form)  {
//review json object that gets pushed postReview URL
const json= {
  "restaurant_id":self.restaurant.id,
  "name":reviewForm123.elements[0].value,
  "rating":reviewForm123.elements[1].value,
  "comments":reviewForm123.elements[2].value,
  "date":Date.now()
};
//check if every field is filled out
if(validateInputs(reviewForm123.elements)){
  DBHelper.postReviews(JSON.stringify(json)).then(function (result){
    self.reviews.push(result);  
    fillReviewsHTML();
}).catch(function(error){

    self.reviews.push(json);
    fillReviewsHTML();
  });
}
}
validateInputs=(reviewForm123)=>{
  let valid =true;
const  message_container= document.querySelector('#message_container');
//if field is empty message container will be filled and style will be added
message_container.innerHTML='';
//check for null and if rating empty which shouldn't be possible.
if(reviewForm123[0].value ==='' ||  reviewForm123[2].value ==='')
 {
  //if reviewForm123 inputs are equal to '' then valid will be false
   valid =false;
   //adds class notvalid to create red border box for visual 
   message_container.classList.add("notvalid");
   message_container.innerHTML='Please fill above empty fields!'; 
}
 return valid;
}