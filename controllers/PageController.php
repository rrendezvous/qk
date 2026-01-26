<?php

class PageController
{
    public function serveApp($params)
    {
        // This controller serves the main HTML file for the React app.
        // The frontend router will handle the specific page rendering.
        header("Content-Type: text/html");
        readfile('index.html');
        exit;
    }
}
