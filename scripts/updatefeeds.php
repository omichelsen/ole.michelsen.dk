<?php
// http://api.twitter.com/statuses/user_timeline.rss?user_id=201893588&count=5
// http://plusfeed.appspot.com/114579361894786630263

// Updates external feeds to a local file for caching
function GetFeed($url,$path)
{
	// Attempt download to temp file
	$pathTemp = $path.'-temp';

    $fp = fopen($pathTemp, 'w');
 
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
 
    $result = curl_exec($ch);
 
    curl_close($ch);
    fclose($fp);

	// Rename file if successful
	if ($result)
	{
		rename($pathTemp,$path);
	}
    
    return $result;
}

function GetFeedTimer($name,$url,$path)
{
	$start = microtime(true);
	
	$result = GetFeed($url,$path) ? 'done' : 'fail';
	
	$end = microtime(true);
	
	$time = number_format($end - $start, 4);
	
	printf(str_pad($name,10)." $result in: %8s sec\n", $time);
}

// Output as plain text
header("Content-Type: text/plain");

// Download Google+ feed
//GetFeedTimer(	'GooglePlus',
//				'http://pipes.yahoo.com/pipes/pipe.run?_id=0c48ef5e1176d2f8fef2e4f58927c5b9&_render=rss',
//				'../feeds/googleplus.rss'	);

// Download Twitter feed
//GetFeedTimer(	'Twitter',
//				//'http://pipes.yahoo.com/pipes/pipe.run?_id=055f5cc6234733e445ecd51c34bdf577&_render=rss',
//				'http://www.twitter-rss.com/user_timeline.php?screen_name=omichelsen',
//				'../feeds/twitter.rss'	);

// Download Flickr feed
GetFeedTimer(	'Flickr',
				'http://api.flickr.com/services/feeds/photos_public.gne?id=16324363@N07&lang=en-us&format=rss_200',
		    	'../feeds/flickr.rss');
?>