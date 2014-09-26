<?php
/* Calls the W3C Markup Validator Web Service for a given URI
   and returns the result in JSON format
 */
function fetchUri($uri)
{
	// Open connection
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_USERAGENT, 'curl/7.9.8 (i686-pc-linux-gnu) libcurl 7.9.8 (OpenSSL 0.9.6b) (ipv6 enabled)');
	curl_setopt($ch, CURLOPT_URL, $uri);
	curl_setopt($ch, CURLOPT_HEADER, 1);
	curl_setopt($ch, CURLOPT_NOBODY, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	$doc = curl_exec($ch);

	if ($doc === FALSE) {
		die(curl_error($ch));
	}

	// Close connection
	curl_close($ch);
	
	return $doc;
}

function http_parse_headers( $header )
{
    $retVal = array();
    $fields = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $header));
    foreach( $fields as $field ) {
        if( preg_match('/([^:]+): (.+)/m', $field, $match) ) {
            $match[1] = preg_replace('/(?<=^|[\x09\x20\x2D])./e', 'strtoupper("\0")', strtolower(trim($match[1])));
            if( isset($retVal[$match[1]]) ) {
                $retVal[$match[1]] = array($retVal[$match[1]], $match[2]);
            } else {
                $retVal[$match[1]] = trim($match[2]);
            }
        }
    }
    return $retVal;
}

$uri = $_GET['uri'];
if($uri) 
{
	// Create URI for W3C validation service
	$validator = "http://validator.w3.org/check?uri=".urlencode($uri)."&output=json";

	// Request a W3C validation of the given URI
	$w3cresult = fetchUri($validator);

	// Parse the header and return a json object
	$headers = http_parse_headers($w3cresult);
	$valid = $headers['X-W3c-Validator-Status'] == 'Valid' ? 'Passed' : 'Failed';
	$error = $headers['X-W3c-Validator-Errors'] . ' error(s)';
/*
	// Parse the W3C validation response as XML
	$doc = new DOMDocument();
	$ret = @$doc->loadXML($w3cresult);
	if($ret)
	{
		// Create an XPath query.
		// Note: you must define the namespace if the XML document has defined namespaces.
		$xpath = new DOMXPath($doc);
		$xpath->registerNamespace('env', "http://www.w3.org/2003/05/soap-envelope");
		$xpath->registerNamespace('m', "http://www.w3.org/2005/10/markup-validator");

		// Locate the value for the (first) validity result field.
		$query = "//env:Envelope/env:Body/m:markupvalidationresponse/m:validity";
		$valid = $xpath->query($query)->item(0)->nodeValue;

		if($valid)
		{
			// Convert to result string
			if (strtolower($valid) == 'true')
				$valid = "Passed";
			else
				$valid = "Failed";
		}
		else
		{
			// If our request failed (e.g. wrong URI), output error messag
			$query = "//env:Envelope/env:Body/env:Fault/env:Reason/env:Text";
			$error = $xpath->query($query)->item(0)->nodeValue;
		}
	}
*/
}

// Output JSON object (empty value if error)
echo json_encode(array('valid' => $valid, 'error' => $error));
?>