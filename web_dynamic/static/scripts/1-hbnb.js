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
});
