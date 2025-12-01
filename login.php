<?php
session_start();

// Redirect if already logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: index.php');
    exit;
}

 $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Default credentials: admin / admin123
    if ($username === 'rama' && $password === 'admin123') {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        header('Location: index.php');
        exit;
    } else {
        $error = 'Username atau password salah!';
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Aplikasi Kasir UMKM</title>
    
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
        }

        .login-container {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .login-header {
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .login-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='rgba(255,255,255,0.03)' fill-opacity='0.05' d='M20 20L80 80M80 20L20 80'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 50px 50px;
        }

        .login-header h1 {
            font-size: 1.8em;
            margin-bottom: 5px;
            position: relative;
            z-index: 1;
        }

        .login-header p {
            opacity: 0.9;
            font-size: 0.9em;
            position: relative;
            z-index: 1;
        }

        .login-icon {
            font-size: 3em;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }

        .login-body {
            padding: 30px;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #e0e0e0;
        }

        .form-input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s, box-shadow 0.3s;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        .form-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .form-input:focus {
            outline: none;
            border-color: #64b5f6;
            box-shadow: 0 0 0 3px rgba(100, 181, 246, 0.1);
        }

        .btn-login {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(26, 35, 126, 0.4);
        }

        .btn-login i {
            margin-right: 8px;
        }

        .error-message {
            background: rgba(244, 67, 54, 0.2);
            color: #ffebee;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            border-left: 4px solid #f44336;
        }

        .credentials-hint {
            background: rgba(33, 150, 243, 0.2);
            color: #bbdefb;
            padding: 12px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 0.85em;
            text-align: center;
        }

        .login-footer {
            text-align: center;
            margin-top: 20px;
            color: #90caf9;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="login-icon"><i class="fa-solid fa-cart-shopping"></i></div>
            <h1>Aplikasi Kasir UMKM</h1>
            <p>Silakan login untuk melanjutkan</p>
        </div>
        <div class="login-body">
            <?php if ($error): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" 
                           class="form-input" placeholder="Masukkan username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" 
                           class="form-input" placeholder="Masukkan password" required>
                </div>
                <button type="submit" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>

            <div class="credentials-hint">
                <strong>Default Credentials:</strong><br>
                Username: rama<br>
                Password: admin123
            </div>

            <div class="login-footer">
                &copy; 2025 Aplikasi Kasir UMKM
            </div>
        </div>
    </div>
</body>
</html>