<?php
include(getenv("DOCUMENT_ROOT").'/includes/functions.php');
include('ExifReader.php');

$dir = '../photos/map';
$dirThumbs = $dir.'/t';

// Extract GPS coordinates from JPEG files in given dir
function getEXIFImageData($args)
{
    $target = $args[0];
    $params = explode(',', $args[1]);

    $exif = new ExifReader();
    if (is_file($target)) return $exif->readImage($target, $params);
    if (is_dir($target)) return $exif->readDirectory($target, $params);

    return array('ERROR: Target Does Not Exist');
}

// Round GPS coordinates to 4 decimal points
function latlngRound(&$val, $key)
{
    $val = round($val,4);
}

// Output the coords to the map
$images = getEXIFImageData(array($dir, 'gps'));
if ($images)
{
    foreach($images as $data)
    {
        // Reduce output JSON array size by rounding coordinates (precision not needed)
        array_walk($data['gps'], 'latlngRound');

        // Store for JSON array
        $jsArr[] = $data['gps'];

        // Store filename and size of thumbnails
        $filename = $data['name'];
        $size = getimagesize("$dirThumbs/$filename");
        $imgArr[] = array(filename => $filename, width => $size[0], height => $size[1]);
    }
}

echo json_encode($jsArr);
?>
