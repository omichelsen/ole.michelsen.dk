<?php
/* Requests an XML sitemap and returns the <loc> value
   of each <url> element as a JSON array.
 */

$uris = array();
$sitemap = $_GET['uri'];

if(preg_match("/^http(s)?:\/\/.+?/i", $sitemap))
{
	// Remove hostname from local server URI's (fails DNS lookup)
	if(strpos($sitemap, 'ole.michelsen.dk'))
		$sitemap = str_replace('http://ole.michelsen.dk', '..', $sitemap);

	$doc = new DOMDocument();
	$ret = @$doc->load($sitemap);

	if($ret)
	{
		// Detect whether feed is Google Sitemap or RSS
		if(strtolower($doc->documentElement->tagName) == 'urlset')
		{
			// Sitemap
			$itemelem = 'url';
			$urielem = 'loc';
		}
		else
		{
			// RSS
			$itemelem = 'item';
			$urielem = 'link';
		}

		$urls = $doc->getElementsByTagName($itemelem);
		foreach( $urls as $url )
		{
			$uris[] = $url->getElementsByTagName($urielem)->item(0)->nodeValue;
		}
	}
}

// Outpot array no matter what, empty if error
echo json_encode($uris);
?>