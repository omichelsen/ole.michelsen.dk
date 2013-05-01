$(document).ready(function() {

	// Bind the validate and replace buttons of the input form	
	$('#regex').submit(function() { runRegEx(false); return false; });
	$('#doReplace').bind('click', function() { runRegEx(true); return false; });
	$('#doValidate').bind('click', function() { runRegEx(false); return false; });

	// Bind the sample "Test" links
	$('#samples a').bind('click', function() { copySample($(this).attr('href')); return false; });

	function runRegEx(doReplace) {

		var pattern = $('#pattern').val();
		var input = $('#input').val();
		var replace = $('#replace').val();
		
		// Only pass on replace statement if replace button was clicked
		if (!doReplace) replace = '';
		
		// Iterate the selected switches
		var modifiers = '';
		$('input:checked').each(function(){
        	modifiers += $(this).val();
        });
        
        // Detect use of lookbehind and revert to PHP
        if (pattern.indexOf("?<=") >= 0 || pattern.indexOf("?<!") >= 0)
        	$('#engine').val("php");
		
		if ($('#engine').val()=="js") {

			try {
				$("#matches").val(jsRegEx(pattern, modifiers, replace, input));
			} catch(err) {
				$("#matches").val(err);
			}
			
		} else {

			phpRegEx(pattern, modifiers, replace, input);

		}
	}		
	
	function jsRegEx(pattern, modifiers, replace, subject) {
		// Since forward slashes delimit the regular expression, any forward slashes that appear in the regex need to be escaped. E.g. the regex 1/2 is written as /1\/2/ in JavaScript.
		var escaped = pattern.replace('/','\/');

		// Instantiate RegExp object (needed when pattern is from variable)
		var re = new RegExp(escaped, modifiers);

		if (replace && replace.length > 0) {
			var m = subject.replace(re, replace);
			if (m == null) {
				return "No match";
			} else {
				return m;
			}
		}
		else {
			// Run regular expression against input string
			var m = subject.match(re);
		
			if (m == null) {
				return "No match";
			} else {
				var s = "";
				for (var i=0; i < m.length; i++) {
					if(m[i])
						s += i + ": " + m[i] + "\n";
				}
				return s;
			}
		}
	}
	
	function phpRegEx(pattern, modifiers, replace, subject) {

		// Serialize form data
		var formdata = 'pattern='+encodeURIComponent(pattern)
			+'&modifiers='+encodeURIComponent(modifiers)
			+'&replace='+encodeURIComponent(replace)
			+'&input='+encodeURIComponent(subject);
		
		// Post to PHP with AJAX
		$.post('regex.php'
			, formdata
			, function(data) {
				
				$("#matches").val(data);

			}
		);
	}
	
	function copySample(sampleId) {

		// Pattern is fetched from the first <td>
		$("#pattern").val($(sampleId+' td:first').html());
		
		// Input is fetched from first <span> (in second <td>)
		$("#input").val($(sampleId+' span:first').html());

	}

});