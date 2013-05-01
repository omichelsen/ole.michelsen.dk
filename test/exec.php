<?php
$command = 'java -jar yuicompressor-2.4.2.jar -h';

echo exec($command, $output = array());
print_r($output);
echo passthru('java -jar yuicompressor-2.4.2.jar -h');
echo passthru('java -version');
echo passthru('whoami');
?>