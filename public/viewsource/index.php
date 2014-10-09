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
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	    ga('create', '#{ services.analytics }', 'auto');
	    ga('send', 'pageview');
	</script>
</head>

<body>

<?php echo $htmlenc; ?>

</body>
</html>
