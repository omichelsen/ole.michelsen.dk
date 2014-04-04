<?php

define("WWWROOT", getenv("DOCUMENT_ROOT"));

function jQueryCdn()
{
	echo '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>', "\n";
}

$jQueryUICdn = function()
{
	echo '<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>', "\n";
}

?>
