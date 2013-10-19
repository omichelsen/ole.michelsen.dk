<?php
/**
 *  Given a file, i.e. /css/base.css, replaces it with a string containing the
 *  file's mtime, i.e. /css/base.1221534296.css.
 *  
 *  @param $file  The file to be loaded.  Must be an absolute path (i.e.
 *                starting with slash).
 */
function auto_version($file)
{
	if(strpos($file, '/') !== 0 || !file_exists($_SERVER['DOCUMENT_ROOT'] . $file))
		return $file;

	$mtime = filemtime($_SERVER['DOCUMENT_ROOT'] . $file);
	return preg_replace('{\\.([^./]+)$}', ".$mtime.\$1", $file);
}

/** .htaccess
	RewriteEngine on
	RewriteCond %{REQUEST_FILENAME} !-s # Make the file doesn't actually exist
	RewriteRule ^(.*)\.[\d]+\.(css|js)$ $1.$2 [L] # Strip out the version number
 **/
?>