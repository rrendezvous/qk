<?php
header("Content-Type: application/json");

require_once "core/config.php";
require_once "core/router.php";
require_once "core/controller.php";
require_once "core/session_handler.php";

class App
{
    private $router;

    public function __construct()
    {
        $this->router = new Router();
    }

    public function pageHandler()
    {
        // Serve frontend for all non-API routes
        $this->router->get('/', 'PageController::serveApp');
        $this->router->get('/login', 'PageController::serveApp');
        $this->router->get('/signup', 'PageController::serveApp');
        $this->router->get('/post-job', 'PageController::serveApp');
        $this->router->get('/my-jobs', 'PageController::serveApp');
        $this->router->get('/my-apps', 'PageController::serveApp'); 
        $this->router->get('/profile', 'PageController::serveApp');
        $this->router->get('/admin', 'PageController::serveApp'); // New Admin Page

        // API Routes
        $this->router->post('/api/login', 'UserController::login');
        $this->router->post('/api/signup', 'UserController::signup');
        $this->router->post('/api/logout', 'UserController::logout');
        $this->router->get('/api/me', 'UserController::me');
        $this->router->post('/api/verify', 'UserController::uploadVerification');

        // Job API Routes
        $this->router->get('/api/jobs', 'JobsController::getAll');
        $this->router->post('/api/jobs', 'JobsController::create');
        $this->router->post('/api/jobs/{job_id}/apply', 'JobsController::apply');
        
        $this->router->get('/api/my-jobs', 'JobsController::getMyJobs');
        $this->router->get('/api/jobs/{job_id}/applicants', 'JobsController::getApplicants');
        $this->router->post('/api/applications/{app_id}/approve', 'JobsController::approveApplication');
        // ... existing routes ...
$this->router->post('/api/jobs/{job_id}/submit-payment', 'JobsController::submitPayment'); // Employer uploads proof
$this->router->post('/api/jobs/{job_id}/confirm-payment', 'JobsController::confirmPayment'); // Worker confirms receipt
// ... existing routes ...

        $this->router->post('/api/jobs/{job_id}/mark-done', 'JobsController::markDone');
        $this->router->post('/api/jobs/{job_id}/complete', 'JobsController::completeJob');
        $this->router->post('/api/jobs/{job_id}/rate-employer', 'JobsController::rateEmployer'); // New
        $this->router->post('/api/jobs/{job_id}/report', 'JobsController::reportJob');

        $this->router->get('/api/my-applications', 'JobsController::getMyApplications');

        // ADMIN ROUTES
        $this->router->get('/api/admin/disputes', 'JobsController::getAdminDisputes');
        $this->router->post('/api/admin/jobs/{job_id}/resolve', 'JobsController::resolveDispute');

        $this->router->handleRequest();
    }
}

$app = new App();
$app->pageHandler();