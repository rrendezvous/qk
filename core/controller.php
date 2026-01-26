<?php
foreach (scandir('controllers/') as $filename) {
    $path = 'controllers/' . $filename;
    if (is_file($path) && pathinfo($path, PATHINFO_EXTENSION) === 'php') {
        require_once $path;
    }
}
?>
