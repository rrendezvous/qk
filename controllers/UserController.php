<?php

class UserController
{
    private function secure_input($data)
    {
        return htmlspecialchars(stripslashes(trim($data)));
    }

    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true);
    }

    public function signup()
    {
        global $pdo;
        $data = $this->getJsonInput();

        $name = $this->secure_input($data['name']);
        $username = filter_var($data['username'], FILTER_VALIDATE_EMAIL);
        $password = $data['password'];
        $role_text = $data['role']; // 'worker' or 'employer'
        $barangay = $this->secure_input($data['barangay']);
        
        $role = ($role_text === 'employer') ? 1 : 2;

        if (!$username || empty($password) || empty($name) || empty($barangay)) {
            echo json_encode(['status' => 'false', 'message' => 'All fields are required.']);
            return;
        }

        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            echo json_encode(['status' => 'false', 'message' => 'Email already registered.']);
            return;
        }

        $password_hash = password_hash(APP_SECRET . ':' . $password, PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare("INSERT INTO users (name, username, password, role, barangay) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $username, $password_hash, $role, $barangay]);

        echo json_encode(['status' => 'true']);
    }

    public function login()
    {
        global $pdo;
        $data = $this->getJsonInput();
        $username = $data['username'];
        $password = $data['password'];

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify(APP_SECRET . ':' . $password, $user['password'])) {
            $token = bin2hex(random_bytes(32));
            $expiration = date('Y-m-d H:i:s', strtotime('+1 day'));
            
            $stmt = $pdo->prepare("INSERT INTO session_tokens (user_id, token, expiration) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $token, $expiration]);
            
            $_SESSION['token'] = $token;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['name'] = $user['name'];

            echo json_encode([
                'status' => 'true',
                'id' => $user['id'],
                'name' => $user['name'],
                'role' => $user['role']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'false', 'message' => 'Invalid username or password.']);
        }
    }

    public function logout()
    {
        global $pdo;
        if (isset($_SESSION['token'])) {
            $stmt = $pdo->prepare("DELETE FROM session_tokens WHERE token = ?");
            $stmt->execute([$_SESSION['token']]);
        }
        session_unset();
        session_destroy();
        echo json_encode(['status' => 'true']);
    }

    public function me()
    {
        global $pdo;
        if (isset($_SESSION['user_id'])) {
            // Check DB for status
            $stmt = $pdo->prepare("SELECT verification_status FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $status = $user ? $user['verification_status'] : 'unverified';
            
            $_SESSION['verification_status'] = $status;

            echo json_encode([
                'logged_in' => true,
                'user_id' => $_SESSION['user_id'],
                'name' => $_SESSION['name'],
                'role' => $_SESSION['role'],
                'verification_status' => $status 
            ]);
        } else {
            echo json_encode(['logged_in' => false]);
        }
    }

    public function uploadVerification()
    {
        global $pdo;
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['status' => 'false', 'message' => 'Not logged in']);
            return;
        }

        if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['status' => 'false', 'message' => 'No file uploaded.']);
            return;
        }

        $user_id = $_SESSION['user_id'];
        $uploadDir = 'uploads/';
        
        $fileName = $user_id . '_' . time() . '_' . basename($_FILES['document']['name']);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['document']['tmp_name'], $targetPath)) {
            // Auto-verify the user immediately
            $stmt = $pdo->prepare("UPDATE users SET verification_status = 'verified', verification_file = ? WHERE id = ?");
            $stmt->execute([$fileName, $user_id]);
            
            $_SESSION['verification_status'] = 'verified'; 
            
            echo json_encode(['status' => 'true', 'message' => 'Verification Successful!']);
        } else {
            echo json_encode(['status' => 'false', 'message' => 'Upload failed.']);
        }
    }
    

}