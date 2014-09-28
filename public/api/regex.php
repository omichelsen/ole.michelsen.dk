<?php
// Run on PostBack
if($_POST) 
{
	$pattern = str_replace('/','\/',stripslashes($_POST['pattern']));
	$modifiers = $_POST['modifiers'];
	$replace = stripslashes($_POST['replace']);
	$input = stripslashes($_POST['input']);
	
	$out = "";

	if (strlen($replace) > 0) 
	{
		// Run replace
		$matches = preg_replace("/$pattern/$modifiers",$replace,$input);
		
		foreach($matches as $key=>$value)
		{
			$out .= "$key: $value\n";
		}
	} 
	else 
	{
		if (strpos($modifiers,'g') >= 0) 
		{
			// Remove unknown modifier 'g'
			$modifiers = str_replace('g','',$modifiers);

			@preg_match_all("/$pattern/$modifiers",$input,$matches);

			$error = error_get_last();

			if (count($matches[0]) > 0)
			{
				foreach($matches as $match)
				{
					foreach($match as $key=>$value)
						$out .= "$key: $value\n";
				}
			}
		} 
		else 
		{
			@preg_match("/$pattern/$modifiers",$input,$matches);
			
			$error = error_get_last();

			if (count($matches) > 0)
			{
				foreach($matches as $key=>$value)
				{
					$out .= "$key: $value\n";
				}
			}
		}
	}
	
	if ($error) 
	{
		$msg = $error["message"];
		
		// Remove the initial part of the message containing the PHP function name
		echo substr($msg, strpos($msg, ': ') + 2);
	}
	else if ($out)
	{
		echo $out;
	}
	else 
	{
		echo 'No match';
	}
}
?>