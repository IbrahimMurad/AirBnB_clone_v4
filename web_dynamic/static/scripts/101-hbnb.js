const states = {};
const cities = {};
const amenities = {};
const users = {};

function sellectedAmenities () {
  $('DIV.amenities h4').text(Object.values(amenities).join(', '));
}

function sellectedLocations () {
  const locations = Object.values(states).concat(Object.values(cities));
  $('DIV.locations h4').text(locations.join(', '));
}

function getData (id, type) {
  return $.ajax({
    url: `http://0.0.0.0:5001/api/v1/places/${id}/${type}`,
    async: false,
    success: function (data) { return data; }
  }).responseJSON;
}

function formatDate (dateString) {
  // Parse the given date string into a JavaScript Date object
  const date = new Date(dateString);

  // Define arrays for ordinal suffixes and month names
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Get day, month, and year components
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Add the ordinal suffix to the day
  let suffix;
  if (day % 10 === 1 && day !== 11) {
    suffix = 'st';
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd';
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }

  // Format the date string
  const formattedDate = String(day) + suffix + ' ' + months[month] + ' ' + year;

  return formattedDate;
}

function populatePlaces (places) {
  $('section.places').empty();
  for (const place of places) {
    const thePlace = document.createElement('article');

    const placeTitle = document.createElement('div');
    const placeInfo = document.createElement('div');
    const placeUser = document.createElement('div');
    const placeDescription = document.createElement('div');

    placeTitle.classList.add('title_box');

    const placeName = document.createElement('h2');
    placeName.textContent = place.name;
    placeTitle.appendChild(placeName);

    const priceByNight = document.createElement('div');
    priceByNight.classList.add('price_by_night');
    priceByNight.textContent = '$' + place.price_by_night;
    placeTitle.appendChild(priceByNight);

    thePlace.appendChild(placeTitle);

    placeInfo.classList.add('information');

    const maxGuest = document.createElement('div');
    maxGuest.classList.add('max_guest');
    maxGuest.textContent = place.max_guest + ' Guests';
    placeInfo.appendChild(maxGuest);

    const numRooms = document.createElement('div');
    numRooms.classList.add('number_rooms');
    numRooms.textContent = place.number_rooms + ' Bedrooms';
    placeInfo.appendChild(numRooms);

    const numBathrooms = document.createElement('div');
    numBathrooms.classList.add('number_bathrooms');
    numBathrooms.textContent = place.number_bathrooms + ' Bathrooms';
    placeInfo.appendChild(numBathrooms);

    thePlace.appendChild(placeInfo);

    placeUser.classList.add('user');
    placeUser.innerHTML = `<b>Owner:</b> ${users[place.user_id]}`;

    thePlace.appendChild(placeUser);

    placeDescription.classList.add('description');
    placeDescription.innerHTML = place.description;

    thePlace.appendChild(placeDescription);

    const placeAmenities = document.createElement('div');
    placeAmenities.classList.add('amenities');

    const amenityTitle = document.createElement('h2');
    amenityTitle.textContent = 'Amenities';

    placeAmenities.appendChild(amenityTitle);

    const amenityList = document.createElement('ul');

    const listOfAmenities = getData(place.id, 'amenities');

    for (const amenity of listOfAmenities) {
      const amenityElement = document.createElement('li');
      amenityElement.innerHTML = '&nbsp; &nbsp;' + amenity.name;
      if (['Cable TV', 'TV'].includes(amenity.name)) { amenityElement.classList.add('tv'); } else if (amenity.name === 'Wireless Internet') { amenityElement.classList.add('wifi'); } else if (amenity.name === 'Pets allowed') { amenityElement.classList.add('pets'); }
      amenityList.appendChild(amenityElement);
    }

    placeAmenities.appendChild(amenityList);
    thePlace.appendChild(placeAmenities);

    const placeReviews = document.createElement('div');
    placeReviews.classList.add('reviews');

    const reviewTitle = document.createElement('h2');
    reviewTitle.textContent = 'Reviews';

    const show = document.createElement('span');
    show.textContent = 'show';

    placeReviews.appendChild(reviewTitle);
    placeReviews.appendChild(show);

    const reviewList = document.createElement('ul');

    const listOfReviews = getData(place.id, 'reviews');

    for (const review of listOfReviews) {
      const reviewElement = document.createElement('li');
      const userDate = document.createElement('h3');
      userDate.textContent = `From ${users[review.user_id]} the ${formatDate(review.created_at)}`;
      const reviewText = document.createElement('p');
      reviewText.innerHTML = review.text;
      reviewElement.appendChild(userDate);
      reviewElement.appendChild(reviewText);
      reviewList.appendChild(reviewElement);
    }

    placeReviews.appendChild(reviewList);

    show.addEventListener('click', function () {
      if (reviewList.style.display === 'block') {
        reviewList.style.display = 'none';
        show.textContent = 'show';
      } else {
        reviewList.style.display = 'block';
        show.textContent = 'hide';
      }
    });

    thePlace.appendChild(placeReviews);

    $('section.places').append(thePlace);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  $.get('http://0.0.0.0:5001/api/v1/users', function (data) {
    for (const user of data) {
      users[user.id] = `${user.first_name} ${user.last_name}`;
    }
  });

  $('input:checkbox').change(
    function () {
      if ($(this).is(':checked')) {
        if ($(this).hasClass('state')) {
          states[$(this).attr('data-id')] = $(this).attr('data-name');
          sellectedLocations();
        } else if ($(this).hasClass('city')) {
          cities[$(this).attr('data-id')] = $(this).attr('data-name');
          sellectedLocations();
        } else {
          amenities[$(this).attr('data-id')] = $(this).attr('data-name');
          sellectedAmenities();
        }
      } else {
        if ($(this).hasClass('state')) {
          delete states[$(this).attr('data-id')];
          sellectedLocations();
        } else if ($(this).hasClass('city')) {
          delete cities[$(this).attr('data-id')];
          sellectedLocations();
        } else {
          delete amenities[$(this).attr('data-id')];
          sellectedAmenities();
        }
      }
    }
  );

  $.get('http://0.0.0.0:5001/api/v1/status/', function (data, status) {
    if (status === 'success') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  $.ajax({
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({}),
    success: function (response) {
      populatePlaces(response);
    }
  });

  $('button').on('click', function () {
    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        states: Object.keys(states),
        cities: Object.keys(cities),
        amenities: Object.keys(amenities)
      }),
      success: function (response) {
        populatePlaces(response);
      }
    });
  });
});
