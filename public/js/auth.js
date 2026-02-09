const AUTH_API_BASE_URL = '/api/auth';

// Get form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

// Check if we're on login or register page
const isLoginPage = window.location.pathname.includes('login.html');
const isRegisterPage = window.location.pathname.includes('register.html');

// Show message
function showMessage(message, type) {
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

// Handle login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                // Redirect to home page after successful login
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Show detailed error message
                let errorMsg = data.error || data.message || 'Login failed';
                if (data.details && Array.isArray(data.details)) {
                    errorMsg += ': ' + data.details.join(', ');
                } else if (data.details) {
                    errorMsg += ': ' + data.details;
                }
                showMessage(errorMsg, 'error');
                console.error('Login error response:', data);
            }
        } catch (error) {
            showMessage('Network error: ' + error.message, 'error');
            console.error('Login network error:', error);
        }
    });
}

// Handle register
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role')?.value || 'user';

        try {
            const response = await fetch(`${AUTH_API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include cookies for session
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Registration successful! Redirecting...', 'success');
                // Redirect to home page after successful registration
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                // Show detailed error message - prioritize message field, then error field
                let errorMsg = data.message || data.error || 'Registration failed';
                
                // Add details if available
                if (data.details) {
                    if (Array.isArray(data.details)) {
                        errorMsg += ': ' + data.details.join(', ');
                    } else {
                        errorMsg += ': ' + data.details;
                    }
                }
                
                // Show the error
                showMessage(errorMsg, 'error');
                
                // Log full error for debugging
                console.error('Registration failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                });
            }
        } catch (error) {
            showMessage('Network error: ' + error.message, 'error');
            console.error('Registration network error:', error);
        }
    });
}