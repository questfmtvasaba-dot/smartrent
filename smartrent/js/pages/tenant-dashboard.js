import { PropertyService } from '../api/properties.js';
import { PaymentService } from '../api/payments.js';
import { ChatService } from '../api/chat.js';
import { PropertyCard } from '../components/property-card.js';
import { ChartRenderer } from '../components/charts.js';
import { showNotification } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserProfile } from '../api/supabase-client.js';

export async function loadTenantDashboard() {
    const app = document.getElementById('dashboard-app');
    const user = await getCurrentUser();
    const profile = await getCurrentUserProfile();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <div class="sidebar bg-white w-64 fixed inset-y-0 left-0 z-30 shadow-lg">
                <div class="sidebar-header p-6 border-b">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="font-bold">${profile?.full_name || 'Tenant'}</div>
                            <div class="text-sm text-gray-500">Tenant</div>
                        </div>
                    </div>
                </div>
                
                <nav class="sidebar-nav p-4">
                    <a href="#" class="nav-link active" data-dashboard-nav="overview">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        Overview
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="properties">
                        <i class="nav-icon fas fa-search"></i>
                        Find Properties
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="favorites">
                        <i class="nav-icon fas fa-heart"></i>
                        Favorites
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="bookings">
                        <i class="nav-icon fas fa-calendar-check"></i>
                        My Bookings
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="payments">
                        <i class="nav-icon fas fa-credit-card"></i>
                        Payments
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="messages">
                        <i class="nav-icon fas fa-envelope"></i>
                        Messages
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="profile">
                        <i class="nav-icon fas fa-cog"></i>
                        Settings
                    </a>
                </nav>
            </div>
            
            <!-- Main Content -->
            <div class="ml-64">
                <!-- Top Bar -->
                <header class="bg-white shadow-sm border-b">
                    <div class="flex justify-between items-center px-6 py-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800" id="page-title">Tenant Dashboard</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <button id="mobile-menu-btn" class="md:hidden text-gray-600">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                        </div>
                    </div>
                </header>
                
                <!-- Content Area -->
                <main class="p-6">
                    <div id="dashboard-content">
                        <div class="loading-spinner mx-auto mt-10"></div>
                    </div>
                </main>
            </div>
        </div>
        
        <!-- Mobile Sidebar Overlay -->
        <div id="sidebar-overlay" class="sidebar-overlay"></div>
    `;

    // Load initial content
    await loadOverviewSection();

    // Setup navigation
    setupTenantNavigation();
}

async function loadOverviewSection() {
    const content = document.getElementById('dashboard-content');
    const user = await getCurrentUser();
    
    try {
        // Fetch data in parallel
        const [favorites, payments, paymentStats] = await Promise.all([
            PropertyService.getUserFavorites(user.id),
            PaymentService.getTenantPayments(user.id),
            PaymentService.getPaymentStats(user.id, 'tenant')
        ]);

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-heart text-xl"></i>
                        </div>
                        <div class="stat-value">${favorites.length}</div>
                        <div class="stat-label">Favorite Properties</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-credit-card text-xl"></i>
                        </div>
                        <div class="stat-value">${paymentStats.completed}</div>
                        <div class="stat-label">Completed Payments</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-calendar-check text-xl"></i>
                        </div>
                        <div class="stat-value">0</div>
                        <div class="stat-label">Upcoming Bookings</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-envelope text-xl"></i>
                        </div>
                        <div class="stat-value">0</div>
                        <div class="stat-label">Unread Messages</div>
                    </div>
                </div>
                
                <!-- Recent Favorites -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-bold">Recent Favorites</h3>
                        </div>
                        <div class="card-body">
                            ${favorites.length > 0 ? `
                                <div class="space-y-4">
                                    ${favorites.slice(0, 3).map(property => `
                                        <div class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                            <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                                <img src="${property.property_images && property.property_images.length > 0 ? 
                                                    property.property_images[0].image_url : 
                                                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" 
                                                    alt="${property.title}" class="w-full h-full object-cover rounded-lg">
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <h4 class="font-medium text-gray-900 truncate">${property.title}</h4>
                                                <p class="text-sm text-gray-500 truncate">${property.address}</p>
                                                <p class="text-sm font-bold text-blue-600">₦${property.price?.toLocaleString()}/month</p>
                                            </div>
                                            <button class="btn btn-sm btn-secondary view-property" data-property-id="${property.id}">
                                                View
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                                ${favorites.length > 3 ? `
                                    <div class="mt-4 text-center">
                                        <a href="#" class="text-blue-600 hover:underline" data-dashboard-nav="favorites">
                                            View all favorites
                                        </a>
                                    </div>
                                ` : ''}
                            ` : `
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-heart text-3xl text-gray-300 mb-3"></i>
                                    <p>No favorite properties yet</p>
                                    <a href="#" class="text-blue-600 hover:underline mt-2 inline-block" data-dashboard-nav="properties">
                                        Browse properties
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Recent Payments -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-bold">Recent Payments</h3>
                        </div>
                        <div class="card-body">
                            ${payments.length > 0 ? `
                                <div class="space-y-3">
                                    ${payments.slice(0, 3).map(payment => `
                                        <div class="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <div class="font-medium">${payment.property?.title || 'Property'}</div>
                                                <div class="text-sm text-gray-500">
                                                    ${new Date(payment.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-bold text-green-600">₦${payment.amount?.toLocaleString()}</div>
                                                <span class="badge ${payment.status === 'completed' ? 'badge-success' : 
                                                    payment.status === 'pending' ? 'badge-warning' : 'badge-error'}">
                                                    ${payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                ${payments.length > 3 ? `
                                    <div class="mt-4 text-center">
                                        <a href="#" class="text-blue-600 hover:underline" data-dashboard-nav="payments">
                                            View all payments
                                        </a>
                                    </div>
                                ` : ''}
                            ` : `
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-credit-card text-3xl text-gray-300 mb-3"></i>
                                    <p>No payment history</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-bold">Quick Actions</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition" data-dashboard-nav="properties">
                                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-search text-blue-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Find Properties</div>
                                    <div class="text-sm text-gray-500">Browse available rentals</div>
                                </div>
                            </a>
                            
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 transition" data-dashboard-nav="bookings">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-calendar-check text-green-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Book Inspection</div>
                                    <div class="text-sm text-gray-500">Schedule property viewings</div>
                                </div>
                            </a>
                            
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-200 transition" data-dashboard-nav="messages">
                                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-envelope text-purple-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Messages</div>
                                    <div class="text-sm text-gray-500">Chat with agents</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.getElementById('page-title').textContent = 'Tenant Overview';

        // Setup event listeners for property cards
        PropertyCard.setupEventListeners(content);

    } catch (error) {
        console.error('Error loading overview:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-700 mb-2">Error Loading Dashboard</h2>
                <p class="text-gray-500">Please try refreshing the page</p>
            </div>
        `;
    }
}

function setupTenantNavigation() {
    const content = document.getElementById('dashboard-content');
    
    document.addEventListener('click', async (e) => {
        if (e.target.matches('[data-dashboard-nav]') || e.target.closest('[data-dashboard-nav]')) {
            e.preventDefault();
            const section = e.target.closest('[data-dashboard-nav]').getAttribute('data-dashboard-nav');
            
            // Update active nav item
            document.querySelectorAll('[data-dashboard-nav]').forEach(item => {
                item.classList.remove('active');
            });
            e.target.closest('[data-dashboard-nav]').classList.add('active');
            
            // Load section content
            content.innerHTML = `<div class="loading-spinner mx-auto mt-10"></div>`;
            
            try {
                switch (section) {
                    case 'overview':
                        await loadOverviewSection();
                        break;
                    case 'properties':
                        await loadPropertiesSection();
                        break;
                    case 'favorites':
                        await loadFavoritesSection();
                        break;
                    case 'bookings':
                        await loadBookingsSection();
                        break;
                    case 'payments':
                        await loadPaymentsSection();
                        break;
                    case 'messages':
                        await loadMessagesSection();
                        break;
                    case 'profile':
                        await loadProfileSection();
                        break;
                    default:
                        await loadOverviewSection();
                }
            } catch (error) {
                console.error(`Error loading ${section}:`, error);
                showNotification(`Error loading ${section}`, 'error');
            }
        }
    });
}

async function loadPropertiesSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for properties section
    content.innerHTML = `<div class="text-center py-12"><p>Properties section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Find Properties';
}

async function loadFavoritesSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for favorites section
    content.innerHTML = `<div class="text-center py-12"><p>Favorites section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'My Favorites';
}

async function loadBookingsSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for bookings section
    content.innerHTML = `<div class="text-center py-12"><p>Bookings section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'My Bookings';
}

async function loadPaymentsSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for payments section
    content.innerHTML = `<div class="text-center py-12"><p>Payments section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Payment History';
}

async function loadMessagesSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for messages section
    content.innerHTML = `<div class="text-center py-12"><p>Messages section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Messages';
}

async function loadProfileSection() {
    const content = document.getElementById('dashboard-content');
    // Implementation for profile section
    content.innerHTML = `<div class="text-center py-12"><p>Profile section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Profile Settings';
}