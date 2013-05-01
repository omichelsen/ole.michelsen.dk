<?php

// Output as plain text
header("Content-Type: text/plain");

foreach (getallheaders() as $name => $value) {
    echo "$name: $value\n";
}

echo "\nGET:\n";

foreach ($_GET as $name => $value) {
    echo "$name: $value\n";
}

echo "\nPOST:\n";

foreach ($_POST as $name => $value) {
    echo "$name: $value\n";
}

?>