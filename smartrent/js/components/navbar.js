import { checkAuth, logout } from '../auth/auth.js';
import { showNotification } from '../utils/helpers.js';

export async function loadNavbar() {
    const app = document.getElementById('app');
    const user = await checkAuth();
    
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <a href="/" class="navbar-brand" data-nav="/">
                    <i class="fas fa-home text-blue-600 text-2xl mr-2"></i>
                    <span class="text-xl font-bold">SmartRent</span>
                </a>
                
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#home" class="nav-link" data-nav="/">Home</a>
                    <a href="#properties" class="nav-link" data-nav="/properties">Properties</a>
                    <a href="#about" class="nav-link" data-nav="/about">About</a>
                    <a href="#contact" class="nav-link" data-nav="/contact">Contact</a>
                </div>
                
                <div class="flex items-center space-x-4">
                    ${user ? `
                        <div class="flex items-center space-x-4">
                            <div class="relative group">
                                <button class="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i class="fas fa-bell text-blue-600"></i>
                                    </div>
                                    <span class="hidden md:inline">Notifications</span>
                                </button>
                                <div class="notification-dropdown hidden group-hover:block absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                                    <div class="p-4 border-b">
                                        <h3 class="font-bold">Notifications</h3>
                                    </div>
                                    <div class="max-h-96 overflow-y-auto">
                                        <div class="p-4 text-center text-gray-500">
                                            <div class="loading-spinner mx-auto mb-2"></div>
                                            <p>Loading notifications...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="relative group">
                                <button class="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <span class="hidden md:inline">Account</span>
                                </button>
                                <div class="account-dropdown hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                                    <div class="p-2">
                                        <a href="dashboard.html" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                                            <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                                        </a>
                                        <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg">
                                            <i class="fas fa-cog mr-2"></i>Settings
                                        </a>
                                        <button id="logout-btn" class="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <button class="btn btn-primary" data-auth-modal>
                            <i class="fas fa-user mr-2"></i>Login
                        </button>
                    `}
                    
                    <button id="mobile-menu-btn" class="md:hidden text-gray-700">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="md:hidden hidden bg-white border-t">
            <div class="container mx-auto px-4 py-4 space-y-4">
                <a href="#home" class="block nav-link" data-nav="/">Home</a>
                <a href="#properties" class="block nav-link" data-nav="/properties">Properties</a>
                <a href="#about" class="block nav-link" data-nav="/about">About</a>
                <a href="#contact" class="block nav-link" data-nav="/contact">Contact</a>
            </div>
        </div>
    `;
    
    // Insert navbar at the beginning of app
    app.insertBefore(navbar, app.firstChild);
    
    // Setup event listeners
    setupNavbarEvents();
    
    // Load notifications if user is authenticated
    if (user) {
        loadNotifications();
    }
}

function setupNavbarEvents() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logout();
            } catch (error) {
                showNotification('Error logging out', 'error');
            }
        });
    }
    
    // Dropdown menus
    setupDropdowns();
}

function setupDropdowns() {
    // Notification dropdown
    const notificationBtn = document.querySelector('[class*="notification"]');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = notificationBtn.querySelector('.notification-dropdown');
            dropdown.classList.toggle('hidden');
        });
    }
    
    // Account dropdown
    const accountBtn = document.querySelector('[class*="account-dropdown"]').parentElement;
    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = accountBtn.querySelector('.account-dropdown');
            dropdown.classList.toggle('hidden');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.notification-dropdown, .account-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
}

async function loadNotifications() {
    const notificationContainer = document.querySelector('.notification-dropdown div:last-child');
    if (!notificationContainer) return;
    
    try {
        // This would fetch actual notifications
        // For now, we'll show a placeholder
        setTimeout(() => {
            notificationContainer.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2 text-gray-300"></i>
                    <p>No new notifications</p>
                </div>
            `;
        }, 1000);
    } catch (error) {
        console.error('Error loading notifications:', error);
        notificationContainer.innerHTML = `
            <div class="p-4 text-center text-red-500">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Error loading notifications
            </div>
        `;
    }
}