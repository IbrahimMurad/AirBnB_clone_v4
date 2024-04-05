let amenities = {};
document.addEventListener('DOMContentLoaded', function () {
  $('input:checkbox').change(
    function () {
      if ($(this).is(':checked')) {
        amenities[$(this).attr('data-id')] = $(this).attr('data-name');
        $('DIV.amenities h4').text(Object.values(amenities).join(', '));
      }
	  else {
        delete amenities[$(this).attr('data-id')];
        $('DIV.amenities h4').text(Object.values(amenities).join(', '));
      }
    }
  );

  $.get('http://0.0.0.0:5001/api/v1/status/', function (data, status) {
    if (status === "success") {
      $('div#api_status').addClass('available');
    }
    else {
      $('div#api_status').removeClass('available');
    }
  });
});
