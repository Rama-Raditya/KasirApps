<?php
// ============================================
// AUTHENTICATION SYSTEM
// ============================================

session_start();
require_once 'config.php';

// Default admin credentials (username: admin, password: admin123)
// In production, this should be hashed and stored in database
$ADMIN_USERNAME = 'admin';
$ADMIN_PASSWORD = password_hash('admin123', PASSWORD_DEFAULT);

function checkAuth() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}

function login($username, $password) {
    global $ADMIN_USERNAME, $ADMIN_PASSWORD;
    
    if ($username === $ADMIN_USERNAME && password_verify($password, $ADMIN_PASSWORD)) {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        return true;
    }
    return false;
}

function logout() {
    session_destroy();
    header('Location: login.php');
    exit;
}

// Handle logout request
if (isset($_GET['logout'])) {
    logout();
}
?>