<?php
/* Calls the W3C Markup Validator Web Service for a given URI
   and returns the result in JSON format
 */

function fetchUri($uri)
{
	// Open connection
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $uri);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	$doc = curl_exec($ch);

	if ($doc === FALSE) {
		die(curl_error($ch));
	}

	// Close connection
	curl_close($ch);
	
	return $doc;
}

$uri = $_GET['uri'];

if($uri) 
{
	// Create URI for W3C validation service
	$validator = "http://validator.w3.org/check?uri=".urlencode($uri)."&output=soap12";

	// Request a W3C validation of the given URI
	$w3cresult = fetchUri($validator);

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
}

// Output JSON object (empty value if error)
echo json_encode(array('valid' => $valid, 'error' => $error));
?>