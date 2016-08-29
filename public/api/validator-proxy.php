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

function http_parse_headers($header)
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

if ($_GET['uri'])
{
	// Create URI for W3C validation service (https://validator.w3.org/docs/api.html)
	$validator = "https://validator.w3.org/check?output=json&level=error&uri=".urlencode($_GET['uri']);

	// Request a W3C validation of the given URI
	$w3cresult = fetchUri($validator);

	// Parse the response json object
	$json = json_decode($w3cresult);
	$valid = count($json->messages) == 0 ? "Passed" : "Failed";
	$error = count($json->messages) . " error(s)";
}

// Output JSON object (empty value if error)
echo json_encode([
	'valid' => $valid,
	'error' => $error,
	'report' => $validator
]);
