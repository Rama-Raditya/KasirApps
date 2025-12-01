<?php
// ============================================
// LOGOUT PAGE
// Menghapus session dan redirect ke login
// ============================================

session_start();

// Destroy the session
session_destroy();

// Clear the session cookie
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Redirect to login page
header('Location: login.php');
exit;
?>