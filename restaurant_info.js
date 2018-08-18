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
        format: 'jpg'
      });
      
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      //call to cache shit();
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
      //if (!restaurant) {
      //  console.error(error);
      //  return;
     // }
      fillRestaurantHTML();
      fillBreadcrumb();
     // callback(null, restaurant)
     return Promise.resolve(self.restaurant);
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
  const inputName = renderHtml('input');
  inputName.setAttribute("type","text");
  inputName.setAttribute("name","Name");
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  //const eman = document.getElementById('test');
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
  reviewForm();
  fillReviewsHTML();

}

/**
* MARK as Favorite
*/
markFavorite = (element) => {

  if(self.is_favorite ==='true') {
  element.classList.remove('favorite');
  element.classList.add('unfavorite');
  self.restaurant.is_favorite ='false';
  self.is_favorite ='false';
  element.removeAttribute('aria-label');
  element.setAttribute('aria-label','unfavorite-button');

} else {
  self.restaurant.is_favorite ='true';
  self.is_favorite ='true';
  element.removeAttribute('aria-label');
  element.setAttribute('aria-label','favorite-button');
  element.classList.remove('unfavorite');
  element.classList.add('favorite');
}
DBHelper.markAsFavorite(self.restaurant);

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

function reviewForm (){
  const container = document.getElementById('review-form');
  const form = renderHtml('form');
  
  form.setAttribute('id','reviewForm123');
  form.setAttribute('class','testsync');
 // form.setAttribute('onsubmit','addReview(this);')
  container.appendChild(form);
  //field name
  const headerblock = renderHtml("h2","Review here");
  form.appendChild(headerblock);
  const labelname = renderHtml('label','Reviewer Name:');
  labelname.setAttribute("for","Name");
  const inputName = renderHtml('input');
  inputName.setAttribute("type","text");
  inputName.setAttribute("name","Name");
  inputName.setAttribute("id","Name");
  inputName.setAttribute("placeholder","Review Name");
  inputName.setAttribute("required","");
  form.appendChild(labelname);
  form.appendChild(inputName);
  //field date

  //field rating
  const labelrating = renderHtml('label','Rating');
  labelrating.setAttribute("for","rating");
  const rating = renderHtml('select');
  rating.setAttribute("name","rating");
  rating.setAttribute("id","rating");
  rating.setAttribute("required","");
  const option_1 = renderHtml('option',"1");
  option_1.setAttribute("value","1");
  const option_2 = renderHtml('option',"2");
  option_2.setAttribute("value","2");
  const option_3 = renderHtml('option',"3");
  option_3.setAttribute("value","3");
  const option_4 = renderHtml('option',"4");
  option_4.setAttribute("value","4");
  const option_5 = renderHtml('option',"5");
  option_5.setAttribute("value","5");
  rating.appendChild(option_1);
  rating.appendChild(option_2);
  rating.appendChild(option_3);
  rating.appendChild(option_4);
  rating.appendChild(option_5);
  form.appendChild(labelrating);
  form.appendChild(rating);
  //field text
  const labeltext = renderHtml('label','Review Text:');
  labeltext.setAttribute("for","reviewText1");
 const reviewText = renderHtml("textarea");
 reviewText.setAttribute("rows","4");
 reviewText.setAttribute("cols","50");
 reviewText.setAttribute("form","reviewForm123");
 reviewText.setAttribute("id","reviewText1");
 reviewText.setAttribute("name","reviewTe");
  reviewText.setAttribute("placeholder","Review Text");
/*const reviewText = renderHtml("input");
  inputName.setAttribute("type","text");
  inputName.setAttribute("name","reviewText1");
  inputName.setAttribute("id","reviewText");
  inputName.setAttribute("value","Review Text");*/
  const button = renderHtml("input","Add review");
  button.setAttribute("type","button");
  button.setAttribute("id","synctest");
  button.setAttribute("value","Add Review");
  button.setAttribute("form","reviewForm123");
  button.setAttribute("name","Name");
  button.onclick = addReview
  const message = renderHtml('div','');
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
  if (!reviews) {
    console.log("testerser");
    DBHelper.fetchReviewsByRestaurant(self.restaurant.id).then(function(response){
        self.reviews =response;
        fillReviewsHTML();

      });
    }

  const container = document.getElementById('reviews-container');
  container.innerHTML= '';
  const Review_title = renderHtml('h2','Reviews');
  container.appendChild(Review_title);
  const ul = renderHtml('ul',null);
  ul.id='reviews-list';

  if (!reviews){
    console.log("test12");
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
  self.initMap();
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');

  name.innerHTML = review.name;
  name.setAttribute("class","restraurant-reviewer-name")
  li.appendChild(name);

  const date = renderHtml('p',new Date(review.createdAt).toGMTString().slice(0,16));
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

renderHtml =(name,value) => {
  var element = document.createElement(name);
  if(value) {
    element.innerHTML = value;
  }
  return element;
}

function addReview(form)  {

 //document.getElementById("review-form").style.display = "none";
const json= {
  restaurant_id:self.restaurant.id,
  name:reviewForm123.elements[0].value,
  rating:reviewForm123.elements[1].value,
  comments:reviewForm123.elements[2].value,
  date:Date.now()
};
console.log(json);

if(checkEmptyFields(reviewForm123.elements)){
  DBHelper.postReviews(JSON.stringify(json)).then(function (result){
    self.reviews.push(result);
    
    fillReviewsHTML();
}).catch(function(error){

    self.reviews.push(review);
    fillReviewsHTML();
  });


}
}



checkEmptyFields=(formInputs)=>{
  let valid =true;
const  message_container= document.querySelector('#message_container');
message_container.innerHTML='';
if(formInputs[0].value ===null ||formInputs[0].value ===""|| (formInputs[1].value <1 || formInputs[1].value >5 || formInputs[1].value ==='')||formInputs[2].value ===null || formInputs[2].value ==='')
 {
   valid =false;
   message_container.innerHTML='Please fill above empty feild!';
   message_container.setAttribute('role','alert');
   message_container.setAttribute('aria-live','assertive');
}
 return valid;
}