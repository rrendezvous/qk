<?php

class Router
{
    private $routes = [];
    private $basePath = '/quickkita'; // This makes the router "subfolder-aware"

    public function get($path, $callback) {
        $this->addRoute('GET', $path, $callback);
    }

    public function post($path, $callback) {
        $this->addRoute('POST', $path, $callback);
    }

    private function addRoute($method, $path, $callback)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'callback' => $callback,
        ];
    }

    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // This is the critical fix: remove the base path if it exists
        if (strpos($path, $this->basePath) === 0) {
            $path = substr($path, strlen($this->basePath));
        }
        if (empty($path)) {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = '#^' . preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']) . '$#';
            
            // Trim trailing slash from path if it's not the root
            $requestPath = rtrim($path, '/');
            if (empty($requestPath)) $requestPath = '/';

            if (preg_match($pattern, $requestPath, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                list($controller, $methodName) = explode('::', $route['callback']);
                
                $controllerInstance = new $controller();
                $controllerInstance->$methodName($params);
                return;
            }
        }

        // If no API route matches, it might be a frontend asset or page load
        if (strpos($path, '/api/') !== 0) {
            (new PageController())->serveApp([]);
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'API Route Not Found: ' . $path]);
    }
}