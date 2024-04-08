const amenities = {};

function sellectedAmenities () {
  $('DIV.amenities h4').text(Object.values(amenities).join(', '));
}

function populatePlaces (places) {
  $('section.places').empty();
  for (const place of places) {
    const thePlace = document.createElement('article');

    const placeTitle = document.createElement('div');
    const placeInfo = document.createElement('div');
    // let placeUser = document.createElement('div');
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

    // placeUser.classList.add('user');
    // placeUser.innerHTML = `<b>Owner:</b> ${place.user}`;

    // thePlace.appendChild(placeUser);

    placeDescription.classList.add('description');
    placeDescription.innerHTML = place.description;

    thePlace.appendChild(placeDescription);

    $('section.places').append(thePlace);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  $('input:checkbox').change(
    function () {
      if ($(this).is(':checked')) {
        amenities[$(this).attr('data-id')] = $(this).attr('data-name');
        sellectedAmenities();
      } else {
        delete amenities[$(this).attr('data-id')];
        sellectedAmenities();
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
      data: JSON.stringify({ amenities: Object.keys(amenities) }),
      success: function (response) {
        populatePlaces(response);
      }
    });
  });
});
