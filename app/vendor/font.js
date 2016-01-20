$(function() {
	// Variable to store your files
	var files;

	// Add events
	$('input[type=file]').on('change', prepareUpload);

	// Grab the files and set them to our variable
	function prepareUpload(event)
	{
	  files = event.target.files;
	}

	$('form').submit(function(e) {

		e.stopPropagation(); // Stop stuff happening
		e.preventDefault(); // Totally stop stuff happening

		var data = new FormData();
		$.each(files, function(key, value)
		{
			data.append(key, value);
		});
		console.log(data);

		$.ajax({
			url: 'http://tools.opengine.io/opfont?size=' + $('#font-size').val() + '&atlas=' + $('#atlas').val(),
			method: 'POST',
			data: data,
			cache: false,
			dataType: 'json',
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			success: function(data, textStatus, jqXHR)
			{
				if(typeof data.error === 'undefined')
				{
					// Success so call function to process the form
					submitForm(event, data);
				}
				else
				{
					// Handle errors here
					console.log('ERRORS 1: ' + data.error);
				}
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				if(jqXHR.status == 200) {
					window.location = 'http://tools.opengine.io/' + $('input[type=file]').val().split(/(\\|\/)/g).pop().split('.ttf')[0] + '.opf';
				} else {
					alert(textStatus);
				}
				// Handle errors here
				// console.log('ERRORS 2: ' + textStatus, jqXHR, errorThrown);
				// STOP LOADING SPINNER
			}
		});
		return false;
	});
});
