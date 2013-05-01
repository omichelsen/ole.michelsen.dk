function ajaxFileUpload() {

	//disable the submit button for the duration of the request
	$('input[type=submit]')
	.ajaxStart(function(){
		$(this).prop('disabled', true);
	})
	.ajaxComplete(function(){
		$(this).prop('disabled', false);
	});

	//starting setting some animation when the ajax starts and completes
	$("#loading")
	.ajaxStart(function(){
		$(this).show();
	})
	.ajaxComplete(function(){
		$(this).hide();
	});

	/*
		url: the url of script file handling the uploaded files
                    fileElementId: the file type of input element id and it will be the index of  $_FILES Array()
		dataType: it support json, xml
		secureuri:use secure protocol
		success: call back function when the ajax complete
		error: callback function when the ajax failed
		
    */
	$.ajaxFileUpload
	(
		{
			url:'base64.php', 
			secureuri:false,
			fileElementId:'fileToUpload',
			dataType: 'json',
			success: function (data, status)
			{
				if(typeof(data.error) != 'undefined')
				{
					if(data.error != '')
					{
						alert(data.error);
					}else
					{
						var out = data.msg;
						if($('#mimetype').is(':checked'))
							out = data.mime + out;

						$('#output').val(out).select();

						// Write stats
						var sizeInput = data.size;
						var sizeOutput = data.msg.length;
						var percent = Math.round((sizeOutput/sizeInput-1)*100);
						$('#resultstats').html('Size increased from '+sizeInput+' to '+sizeOutput+' ('+percent+'%)');
					}
				}
			},
			error: function (data, status, e)
			{
				alert(e);
			}
		}
	)
	
	return false;
}