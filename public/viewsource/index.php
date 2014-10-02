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
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />

	<title>Source of <?php echo htmlspecialchars($uri); ?></title>

	<style>
		pre {
			overflow: auto;
			white-space: pre-wrap;
			word-wrap: break-word;
		}
		<?php echo $stylesheet; ?>
	</style>

	<script type="text/javascript">
	var _gaq=_gaq||[];_gaq.push(["_setAccount","UA-19571265-2"]);_gaq.push(["_trackPageview"]);_gaq.push(['_trackPageLoadTime']);(function(){var a=document.createElement("script");a.type="text/javascript";a.async=true;a.src="http://www.google-analytics.com/ga.js";var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b)})()
	</script>
</head>

<body>

<?php echo $htmlenc; ?>

</body>
</html>
