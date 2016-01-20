function AddAnim(anim, start, end) {
	var count = $('.animation').length + 1;
	var row = $("<div class=\"row form-group animation\"></div>");
	var colText = "<div class=\"col-sm-4\"></div>";
	var col1 = $(colText);
	var col2 = $(colText);
	var col3 = $(colText);
	var animationName = $("<input id=\"anim-name-" + count + "\" placeholder=\"Animation Name\" class=\"form-control\" type=\"textbox\" />");
	var startFrame = $("<input id=\"anim-start-" + count + "\" placeholder=\"Start Frame\" class=\"form-control\" type=\"number\" />");
	var endFrame = $("<input id=\"anim-end-" + count + "\" placeholder=\"End Frame\" class=\"form-control\" type=\"number\" />");
	if(anim) animationName.val(anim);
	if(start) startFrame.val(start);
	if(end) endFrame.val(end);

	col1.append(animationName);
	col2.append(startFrame);
	col3.append(endFrame);
	row.append(col1);
	row.append(col2);
	row.append(col3);

	$("#AnimationList").append(row);
}

function ConvertFrames() {
	var text = $('#frameList').val();
	console.log(text);

	// Normalize the data
	text = text.split('-').join(' ');
	text = text.split('|').join(' ');
	text = text.split(',').join(' ');

	while(text.indexOf('  ') > -1) {
		text = text.split('  ').join(' ');
	}

	text = text.trim();

	text = text.split('\n').join(' ');

	var values = text.split(' ');

	var finished = [];
	var lookingFor = 1;
	for(var i = 0; i < values.length; i++) {
		if(lookingFor == 1) { // Name
			finished.push(values[i]);
			lookingFor++;
		} else if (lookingFor != 1 && isNaN(parseInt(values[i]))){
			finished[finished.length - 1] += " " + values[i];
		} else {
			finished.push(values[i]);
			lookingFor++;
		}
		if(lookingFor >= 4) {
			lookingFor = 1;
		}
	}

	console.log(finished);

	for(var i = 0; i < finished.length / 3; i++) {
		AddAnim(
			finished[i * 3],
			finished[i * 3 + 1],
			finished[i * 3 + 2]);
	}
}

function AddFiles(list, folder) {
	var ul = $('<ul></ul>');
	for(var i = 0 ; i < list.length; i++) {
		ul.append($('<li><a href=\"/' + folder + list[i] + '\">' + list[i] + '</a></li>'));
	}
	$('#Results').append(ul);
}

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
			url: '/opm',
			method: 'POST',
			data: data,
			cache: false,
			dataType: 'json',
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			success: function(data, textStatus, jqXHR)
			{
				console.log(data, textStatus, jqXHR);
				alert('S: ' + textStatus);
				// if(typeof data.error === 'undefined')
				// {
				// 	// Success so call function to process the form
				// 	submitForm(event, data);
				// }
				// else
				// {
				// 	// Handle errors here
				// 	console.log('ERRORS 1: ' + data.error);
				// }
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log(jqXHR, textStatus, errorThrown);
				//alert('E: ' + jqXHR.responseText);

				var count = $('.animation').length;
				var data = {
						filename: jqXHR.responseText,
						output: $('#output').val(),
						Positions: $('#Positions')[0].checked,
						Normals: $('#Normals')[0].checked,
						UVs: $('#UVs')[0].checked,
						Colors: $('#Colors')[0].checked,
						Indices: $('#Indices')[0].checked,
						Tangents: $('#Tangents')[0].checked,
						Bones: $('#Bones')[0].checked,
						Skinning: $('#Skinning')[0].checked,
						Skeletons: $('#Skeletons')[0].checked,
						Animations: $('#Animations')[0].checked,
						TotalAnims: count
				};

				for(var i = 0; i < count; i++) {
					var animNum = i + 1;
					var animName = 'anim-name-' + animNum;
					var animStart = 'anim-start-' + animNum;
					var animEnd = 'anim-end-' + animNum;
					data[animName] = $('#' + animName).val();
					data[animStart] = $('#' + animStart).val();
					data[animEnd] = $('#' + animEnd).val();
				}

				$.ajax({
					url: '/fbxtoopm',
					method: 'POST',
					data: data,
					success: function(data, textStatus, jqXHR) {
						var result = JSON.parse(data);
						AddFiles(result.files, result.folder);
						//alert('success! ' + result.test );
						console.log(data, textStatus, jqXHR);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						//alert('error');
						console.log(jqXHR, textStatus, errorThrown);

						var result = JSON.parse(textStatus);
						AddFiles(result.files, result.folder);
					}
				})
				// if(jqXHR.status == 200) {
				// 	window.location = '/' + $('input[type=file]').val().split(/(\\|\/)/g).pop().split('.ttf')[0] + '.opf';
				// } else {
				// 	alert(textStatus);
				// }
				// Handle errors here
				// console.log('ERRORS 2: ' + textStatus, jqXHR, errorThrown);
				// STOP LOADING SPINNER
			}
		});
		return false;
	});
});
