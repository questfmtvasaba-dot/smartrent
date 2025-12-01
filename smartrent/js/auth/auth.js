import { supabase } from '../api/supabase-client.js';
import { showNotification } from '../utils/helpers.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
}

export async function getUserRole() {
    const user = await checkAuth();
    if (!user) return null;
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    return profile?.role || 'tenant';
}

export function setupAuthModal() {
    const authModal = document.getElementById('auth-modal');
    const authButtons = document.querySelectorAll('[data-auth-modal]');
    const closeButton = authModal?.querySelector('.modal-close');
    
    if (!authModal) return;
    
    // Open modal
    authButtons.forEach(button => {
        button.addEventListener('click', () => {
            loadAuthForms(authModal);
            authModal.classList.remove('hidden');
        });
    });
    
    // Close modal
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }
    
    // Close on backdrop click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
        }
    });
}

async function loadAuthForms(modal) {
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="auth-tabs flex border-b mb-6">
            <button class="auth-tab active flex-1 py-3 font-medium text-center border-b-2 border-blue-600 text-blue-600" data-tab="login">
                Login
            </button>
            <button class="auth-tab flex-1 py-3 font-medium text-center text-gray-500" data-tab="signup">
                Sign Up
            </button>
        </div>
        
        <div id="auth-forms">
            <!-- Forms will be loaded here -->
        </div>
    `;
    
    await loadLoginForm();
    setupAuthTabs();
}

async function loadLoginForm() {
    const authForms = document.getElementById('auth-forms');
    
    authForms.innerHTML = `
        <form id="login-form" class="space-y-4">
            <div class="form-group">
                <label for="login-email" class="form-label">Email Address</label>
                <input type="email" id="login-email" class="form-input" placeholder="your@email.com" required>
            </div>
            
            <div class="form-group">
                <label for="login-password" class="form-label">Password</label>
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
            </div>
            
            <div class="flex justify-between items-center">
                <label class="flex items-center">
                    <input type="checkbox" id="remember-me" class="mr-2">
                    <span class="text-sm text-gray-700">Remember me</span>
                </label>
                <a href="#" class="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
            
            <button type="submit" class="btn btn-primary w-full">
                <i class="fas fa-sign-in-alt mr-2"></i>Login to SmartRent
            </button>
            
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary w-full" id="google-login">
                <i class="fab fa-google mr-2 text-red-500"></i>Google
            </button>
        </form>
    `;
    
    // Add form submission handler
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('google-login').addEventListener('click', handleGoogleLogin);
}

async function loadSignupForm() {
    const authForms = document.getElementById('auth-forms');
    
    authForms.innerHTML = `
        <form id="signup-form" class="space-y-4">
            <div class="form-group">
                <label for="signup-role" class="form-label">I am a</label>
                <select id="signup-role" class="form-select" required>
                    <option value="">Select your role</option>
                    <option value="tenant">Tenant</option>
                    <option value="agent">Agent</option>
                    <option value="landlord">Landlord</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="signup-name" class="form-label">Full Name</label>
                <input type="text" id="signup-name" class="form-input" placeholder="John Doe" required>
            </div>
            
            <div class="form-group">
                <label for="signup-email" class="form-label">Email Address</label>
                <input type="email" id="signup-email" class="form-input" placeholder="your@email.com" required>
            </div>
            
            <div class="form-group">
                <label for="signup-password" class="form-label">Password</label>
                <input type="password" id="signup-password" class="form-input" placeholder="••••••••" required>
                <p class="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and number</p>
            </div>
            
            <div class="form-group">
                <label for="signup-confirm-password" class="form-label">Confirm Password</label>
                <input type="password" id="signup-confirm-password" class="form-input" placeholder="••••••••" required>
            </div>
            
            <div class="form-group">
                <label class="flex items-center">
                    <input type="checkbox" id="agree-terms" class="mr-2" required>
                    <span class="text-sm text-gray-700">
                        I agree to the <a href="#" class="text-blue-600 hover:underline">Terms of Service</a> and 
                        <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
                    </span>
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary w-full">
                <i class="fas fa-user-plus mr-2"></i>Create Account
            </button>
        </form>
    `;
    
    // Add form submission handler
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
}

function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active', 'border-blue-600', 'text-blue-600'));
            this.classList.add('active', 'border-blue-600', 'text-blue-600');
            
            // Load appropriate form
            const tabType = this.getAttribute('data-tab');
            if (tabType === 'login') {
                loadLoginForm();
            } else {
                loadSignupForm();
            }
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        showNotification('Login successful!', 'success');
        document.getElementById('auth-modal').classList.add('hidden');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const role = document.getElementById('signup-role').value;
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (!role) {
        showNotification('Please select your role', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Password must be at least 8 characters with uppercase, lowercase, and number', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role
                }
            }
        });
        
        if (error) throw error;
        
        showNotification('Account created successfully! Please check your email for verification.', 'success');
        document.getElementById('auth-modal').classList.add('hidden');
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleGoogleLogin() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard.html`
            }
        });
        
        if (error) throw error;
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.href = 'index.html';
    } catch (error) {
        showNotification('Error logging out', 'error');
    }
}