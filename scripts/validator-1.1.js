// Set var for no. of active timers
var activeTimers = 0;
var timerIntervalId = 0;

$(document).ready(function() {

	$('#validator').submit(function() {

		// Disable the submit button
		$('input[type=submit]').prop('disabled', true);
		
		// Insert sitemap status message (overwrite previous results)
		$("#results").html('<tr><td class="c" colspan="3">Processing sitemap...<br /><img src="http://cdn.ole.michelsen.dk/images/ajax-loader.gif" height="11" width="16" /></td></tr>');
		
		$.getJSON("validator-sitemap.php", {"uri":$("#sitemapuri").val()}, function(data) {
				if (data.length > 0) {
					var delay = 2000;
					var out = '';
					var requestLimit = 1000;

					$.each(data, function(index,value) {

						out += '<tr' + (index % 2 == 1 ? ' class="alt">' : '>')
							+  '<td class="r">' + (index+1) + ':</td>'
							+  '<td>' + value + '</td>'
							+  '<td class="c" id="loading' + index + '">'
							+	(index < requestLimit ? '<img src="http://cdn.ole.michelsen.dk/images/ajax-loader.gif" height="11" width="16" />' : 'Deferred')
							+  '</td></tr>';

						if (index < requestLimit) {
							// Request the validation service for each uri with specified delay
							setTimeout("validate(" + index + ", '" + value + "')", delay * index);

							// We have added a new timer
							activeTimers++;
						}
					});

					$("#results").html(out);

				} else {

					// No data was returned, so display error message and reenable submit for retry
					$("#results td:first").html('<span style="color:#B00">Sitemap could not be parsed - wrong URI?</span>');
					$('input[type=submit]').prop('disabled', false);

				}
			}
		);

		return false;
	});
});

function validate(index,uri) {

	$.getJSON(
		  "validator-proxy.php"
		, { "uri": uri }
		, function(data) {

			$("#loading"+index).html(
				'<a href="http://validator.w3.org/check?uri=' + encodeURIComponent(uri) + '" target="_blank" style="color:' +
				(data.valid == 'Passed' ? '#006400' : '#B00') + '">' +
				(data.valid || data.error) +
				'</a>'
			);
			
			// Update timer count and check if there are still remaining
			activeTimers--;
			checkTimers();
		}
	);

}

function checkTimers() {
	if(activeTimers < 1) {
		$('input[type=submit]').removeAttr('disabled');
		clearInterval(timerIntervalId);
	}
}