<?php
/**
 * Logout Page
 */
define('SB_INSTALL', true);
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../includes/config.example.php';
require_once __DIR__ . '/../includes/database.class.php';
require_once __DIR__ . '/../includes/functions.php';

if (auth_check()) {
    log_activity('logout', 'User logged out');
}

session_destroy();
session_start();

flash('success', 'You have been logged out successfully.');
redirect('/pages/login.php');
