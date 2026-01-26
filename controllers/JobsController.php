<?php

class JobsController
{
    private function secure_input($data) { return htmlspecialchars(stripslashes(trim($data))); }
    private function getJsonInput() { return json_decode(file_get_contents('php://input'), true); }

    public function getAll()
    {
        global $pdo;
        $stmt = $pdo->query("SELECT j.*, u.name as employer_name FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.status = 'open' ORDER BY j.created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function create()
    {
        global $pdo;
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { http_response_code(403); echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        if (!isset($_SESSION['verification_status']) || $_SESSION['verification_status'] !== 'verified') {
            echo json_encode(['status' => 'false', 'message' => 'Please verify your account first.']);
            return;
        }
        $data = $this->getJsonInput();
        $stmt = $pdo->prepare("INSERT INTO jobs (employer_id, title, category, description, pay, location, duration) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$_SESSION['user_id'], $this->secure_input($data['title']), $this->secure_input($data['category']), $this->secure_input($data['description']), filter_var($data['pay'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION), $this->secure_input($data['location']), $this->secure_input($data['duration'])]);
        echo json_encode(['status' => 'true']);
    }
    
    public function apply($params)
    {
        global $pdo;
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) { http_response_code(403); echo json_encode(['status' => 'false', 'message' => 'Only workers can apply.']); return; }
        if (!isset($_SESSION['verification_status']) || $_SESSION['verification_status'] !== 'verified') {
            echo json_encode(['status' => 'false', 'message' => 'Please verify your account first.']);
            return;
        }
        $job_id = $params['job_id'];
        $worker_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare("SELECT status FROM jobs WHERE id = ?");
        $stmt->execute([$job_id]);
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($job['status'] !== 'open') { echo json_encode(['status' => 'false', 'message' => 'This job is no longer accepting applications.']); return; }
        $stmt = $pdo->prepare("SELECT id FROM applications WHERE job_id = ? AND worker_id = ?");
        $stmt->execute([$job_id, $worker_id]);
        if ($stmt->fetch()) { echo json_encode(['status' => 'false', 'message' => 'You have already applied for this job.']); return; }
        $stmt = $pdo->prepare("INSERT INTO applications (job_id, worker_id) VALUES (?, ?)");
        $stmt->execute([$job_id, $worker_id]);
        echo json_encode(['status' => 'true']);
    }

    public function getMyJobs()
    {
        global $pdo;
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { http_response_code(403); echo json_encode([]); return; }
        $employer_id = $_SESSION['user_id'];
        
        // UPDATED QUERY: Now counts pending applicants for each job!
        $sql = "SELECT j.*, u.name as employer_name, 
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'pending') as applicant_count 
                FROM jobs j 
                JOIN users u ON j.employer_id = u.id 
                WHERE j.employer_id = ? 
                ORDER BY j.created_at DESC";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$employer_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getApplicants($params)
    {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { http_response_code(403); echo json_encode([]); return; }
        $employer_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare("SELECT employer_id FROM jobs WHERE id = ?");
        $stmt->execute([$job_id]);
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$job || $job['employer_id'] != $employer_id) { http_response_code(403); echo json_encode([]); return; }
        
        $stmt = $pdo->prepare("SELECT u.name, u.barangay, u.id as user_id, a.created_at as application_date, a.id as application_id, a.status FROM applications a JOIN users u ON a.worker_id = u.id WHERE a.job_id = ? ORDER BY a.created_at DESC");
        $stmt->execute([$job_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function approveApplication($params) {
        global $pdo;
        $application_id = $params['app_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { http_response_code(403); echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        
        $stmt = $pdo->prepare("SELECT a.job_id, a.worker_id FROM applications a WHERE a.id = ?");
        $stmt->execute([$application_id]);
        $appData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$appData) { echo json_encode(['status' => 'false', 'message' => 'Application not found']); return; }
        $job_id = $appData['job_id'];
        $worker_id = $appData['worker_id'];

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("UPDATE applications SET status = 'approved' WHERE id = ?"); 
            $stmt->execute([$application_id]);
            $stmt = $pdo->prepare("UPDATE applications SET status = 'rejected' WHERE job_id = ? AND id != ? AND status = 'pending'"); 
            $stmt->execute([$job_id, $application_id]);
            $stmt = $pdo->prepare("UPDATE jobs SET status = 'in_progress', worker_id = ? WHERE id = ?"); 
            $stmt->execute([$worker_id, $job_id]);
            
            $pdo->commit();
            echo json_encode(['status' => 'true']);
        } catch (Exception $e) { 
            $pdo->rollBack(); 
            http_response_code(500); 
            echo json_encode(['status' => 'false', 'message' => 'An error occurred: ' . $e->getMessage()]); 
        }
    }

    public function markDone($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        
        $stmt = $pdo->prepare("UPDATE jobs SET status = 'done_pending' WHERE id = ? AND worker_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        if ($stmt->rowCount() > 0) { echo json_encode(['status' => 'true']); } else { echo json_encode(['status' => 'true', 'message' => 'Status updated']); }
    }

    public function submitPayment($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }

        if (!isset($_FILES['proof']) || $_FILES['proof']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['status' => 'false', 'message' => 'Please upload a proof of payment image.']);
            return;
        }

        $uploadDir = 'uploads/';
        $fileName = 'pay_' . $job_id . '_' . time() . '_' . basename($_FILES['proof']['name']);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['proof']['tmp_name'], $targetPath)) {
            $stmt = $pdo->prepare("UPDATE jobs SET status = 'payment_verification', payment_proof = ? WHERE id = ? AND employer_id = ?");
            $stmt->execute([$fileName, $job_id, $_SESSION['user_id']]);
            echo json_encode(['status' => 'true', 'file' => $fileName]);
        } else {
            echo json_encode(['status' => 'false', 'message' => 'Upload failed']);
        }
    }

    public function confirmPayment($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }

        $stmt = $pdo->prepare("UPDATE jobs SET status = 'completed' WHERE id = ? AND worker_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        echo json_encode(['status' => 'true']);
    }

    public function completeJob($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 1) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        
        $data = $this->getJsonInput();
        $rating = isset($data['rating']) ? (int)$data['rating'] : 5;
        $review = isset($data['review']) ? $this->secure_input($data['review']) : '';

        $stmt = $pdo->prepare("UPDATE jobs SET rating = ?, review = ? WHERE id = ? AND employer_id = ?");
        $stmt->execute([$rating, $review, $job_id, $_SESSION['user_id']]);
        
        echo json_encode(['status' => 'true']);
    }

    public function rateEmployer($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        
        $data = $this->getJsonInput();
        $rating = isset($data['rating']) ? (int)$data['rating'] : 5;
        $review = isset($data['review']) ? $this->secure_input($data['review']) : '';

        $stmt = $pdo->prepare("UPDATE jobs SET employer_rating = ?, employer_review = ? WHERE id = ? AND worker_id = ?");
        $stmt->execute([$rating, $review, $job_id, $_SESSION['user_id']]);
        
        echo json_encode(['status' => 'true']);
    }

    public function reportJob($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id'])) { echo json_encode(['status' => 'false', 'message' => 'Unauthorized']); return; }
        
        $data = $this->getJsonInput();
        $reason = isset($data['reason']) ? $this->secure_input($data['reason']) : '';
        $full_reason = "Reported by " . $_SESSION['name'] . ": " . $reason;

        $stmt = $pdo->prepare("UPDATE jobs SET status = 'disputed', report_reason = ? WHERE id = ?");
        $stmt->execute([$full_reason, $job_id]);
        
        echo json_encode(['status' => 'true']);
    }

    public function getMyApplications() {
        global $pdo;
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 2) { http_response_code(403); echo json_encode([]); return; }
        $worker_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare("SELECT j.*, u.name as employer_name, a.status as application_status FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON j.employer_id = u.id WHERE a.worker_id = ? ORDER BY a.created_at DESC");
        $stmt->execute([$worker_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getAdminDisputes() {
        global $pdo;
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 3) { http_response_code(403); echo json_encode([]); return; }
        
        $stmt = $pdo->query("SELECT j.*, u1.name as employer_name, u2.name as worker_name FROM jobs j LEFT JOIN users u1 ON j.employer_id = u1.id LEFT JOIN users u2 ON j.worker_id = u2.id WHERE j.status = 'disputed' ORDER BY j.created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function resolveDispute($params) {
        global $pdo;
        $job_id = $params['job_id'];
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] != 3) { http_response_code(403); echo json_encode(['status' => 'false']); return; }
        
        $stmt = $pdo->prepare("UPDATE jobs SET status = 'closed' WHERE id = ?");
        $stmt->execute([$job_id]);
        echo json_encode(['status' => 'true']);
    }
}