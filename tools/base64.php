<?php
	$error = "";
	$msg = "";
	$mime = "";
	$size = 0;
	$fileElementName = 'fileToUpload';
	if(!empty($_FILES[$fileElementName]['error']))
	{
		switch($_FILES[$fileElementName]['error'])
		{

			case '1':
				$error = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
				break;
			case '2':
				$error = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
				break;
			case '3':
				$error = 'The uploaded file was only partially uploaded';
				break;
			case '4':
				$error = 'No file was uploaded.';
				break;

			case '6':
				$error = 'Missing a temporary folder';
				break;
			case '7':
				$error = 'Failed to write file to disk';
				break;
			case '8':
				$error = 'File upload stopped by extension';
				break;
			case '999':
			default:
				$error = 'No error code avaiable';
		}
	}elseif(empty($_FILES[$fileElementName]['tmp_name']) || $_FILES[$fileElementName]['tmp_name'] == 'none')
	{
		$error = 'No file was uploaded..';
	}else 
	{
			//read the file and base64 encode it
			if (is_uploaded_file($_FILES[$fileElementName]['tmp_name']))
			{
				$msg .= base64_encode(file_get_contents($_FILES[$fileElementName]['tmp_name']));
				$mime = 'data:' . $_FILES[$fileElementName]['type'] . ';base64,';
				$size = @filesize($_FILES[$fileElementName]['tmp_name']);
			}
			//remove the uploaded file(s)
			@unlink($_FILES[$fileElementName]);		
	}
	echo "{";
	echo		"error: '$error',\n";
	echo		"msg: '$msg',\n";
	echo		"mime: '$mime',\n";
	echo		"size: '$size'\n";
	echo "}";
?>