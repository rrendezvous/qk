<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);
// error_reporting(0); // Uncomment for production

@session_start();
date_default_timezone_set('Asia/Manila');

// --- DATABASE CONFIGURATION ---
// This is the only section you should need to edit if your setup is different.
// I have set it to the default for AMPPS.

define("APP_SECRET", "a_very_secret_key_for_passwords");
define("DB_HOST", "127.0.0.1");
define("DB_NAME", "quickkita_db"); // You have already created this database.
define("DB_USER", "root"); // This is almost always 'root' on local servers.

/**
 * --- IMPORTANT: PASSWORD IS SET FOR AMPPS ---
 * AMPPS default password is: "mysql"
 * XAMPP default password is an empty string: ""
 * 
 * I have set it to "mysql" below for you. If you were using XAMPP, you would change it to "".
 */
// define("DB_PASSWORD", ""); // For XAMPP
define("DB_PASSWORD", "mysql"); // For AMPPS - This is now active.

define("DB_STRUCTURE", "db.sql");

// --- DO NOT EDIT BELOW THIS LINE ---

$pdo = null;

try {
    $conn = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '". DB_NAME ."'");
    $exists = $stmt->fetchColumn();

    if (!$exists) {
        // This code block will only run ONCE to create your database and tables.
        $conn->exec("CREATE DATABASE " . DB_NAME);
        $conn->exec("USE " . DB_NAME);
        
        if (file_exists(DB_STRUCTURE)) {
            $sql = file_get_contents(DB_STRUCTURE);
            $conn->exec($sql);
        }
    }
    
    // Establish the persistent connection for the app to use
    $pdo = new PDO("mysql:host=". DB_HOST .";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // If the DB connection fails, return a clear JSON error.
    http_response_code(500);
    echo json_encode(['status' => 'false', 'message' => 'Database connection failed. Please check your username and password in core/config.php. Error: ' . $e->getMessage()]);
    exit;
}