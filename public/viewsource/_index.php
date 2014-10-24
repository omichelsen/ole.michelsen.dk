<?php
include_once('geshi.php');

function markupLinks($html,$uri)
{
	preg_match('/https?:\/\/\S+?(?=\/)/i', $uri, $matches);
	$baseUri = $matches[0];

	$regex = array('/(?<=&quot;)(https?:\/\/\S+)(?=&quot;)/i',	// Absolute links: &quot;http://asdf.com/asdf.php?id=x&ad=y&quot;
				   '/(?<=&quot;)(\/\S+)(?=&quot;)/i');			// Relative links: &quot;/scripts/regex-1.1.min.js&quot;

	$replc = array('<a href="$1">$1</a>',
				   "<a href=\"$baseUri$1\">$1</a>");

	return preg_replace($regex, $replc, $html);
}

$uri = $_GET['uri'];

if ($_POST)
{
	$data = $_POST['DOM'];
	$htmlenc = urldecode($data);

	$geshi = new GeSHi($htmlenc,'html5');
	$geshi->enable_keyword_links(false);
	$geshi->enable_classes();

	$htmlenc = $geshi->parse_code();

	// Substitute tabs for 4 spaces
	$htmlenc = str_replace("\t", '    ', $htmlenc);

	// Trim trailing spaces
	preg_replace("/[ \t]+$/", '', $htmlenc);

	// Markup clickable links
	$htmlenc = markupLinks($htmlenc,$uri);

	// Print geshi stylesheet
	$stylesheet = $geshi->get_stylesheet();
}
?>
