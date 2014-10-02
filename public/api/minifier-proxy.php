<?php
// Run on PostBack
if($_POST) {
	$url = 'http://minifier.michelsen.dk/default.aspx';
	
	$input = stripslashes($_POST['input']);
	
	// Set POST variables	
	$postfields = 'datatype='.urlencode($_POST['datatype']);
	$postfields .= '&engine='.urlencode($_POST['engine']);
	$postfields .= '&input='.urlencode($input);
	
	// Open connection
	$ch = curl_init($url);
	
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
	
	// Execute POST
	echo curl_exec($ch);
	
	// Close connection
	curl_close($ch);
}
?>