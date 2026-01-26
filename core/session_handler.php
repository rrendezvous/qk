<?php

// This file is included at the top of the request lifecycle in index.php
// It checks for a valid session on every API request.

if (isset($_SESSION['token']) && isset($pdo)) {
    $token = $_SESSION['token'];
    
    $stmt = $pdo->prepare("SELECT * FROM session_tokens WHERE token = ? AND expiration > NOW()");
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        // If the token is invalid or expired, destroy the session
        session_unset();
        session_destroy();
    } else {
        // Keep the user info from the session if it's valid
        $_SESSION['user_id'] = $session['user_id'];
    }
}
?>
 