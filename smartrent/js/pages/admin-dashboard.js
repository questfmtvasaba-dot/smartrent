import { AnalyticsService } from '../services/analytics-service.js';
import { ChartRenderer } from '../components/charts.js';
import { showNotification } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserProfile, supabase } from '../api/supabase-client.js';

export async function loadAdminDashboard() {
    const app = document.getElementById('dashboard-app');
    const user = await getCurrentUser();
    const profile = await getCurrentUserProfile();

    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Check if user is admin
    if (profile?.role !== 'admin') {
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p class="text-gray-600">You don't have permission to access the admin dashboard.</p>
                </div>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <div class="sidebar bg-white w-64 fixed inset-y-0 left-0 z-30 shadow-lg">
                <div class="sidebar-header p-6 border-b">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div>
                            <div class="font-bold">${profile?.full_name || 'Admin'}</div>
                            <div class="text-sm text-gray-500">System Administrator</div>
                        </div>
                    </div>
                </div>
                
                <nav class="sidebar-nav p-4">
                    <a href="#" class="nav-link active" data-dashboard-nav="overview">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        Overview
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="users">
                        <i class="nav-icon fas fa-users"></i>
                        User Management
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="properties">
                        <i class="nav-icon fas fa-home"></i>
                        Property Management
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="approvals">
                        <i class="nav-icon fas fa-check-circle"></i>
                        Listing Approvals
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="reports">
                        <i class="nav-icon fas fa-flag"></i>
                        Reports & Issues
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="analytics">
                        <i class="nav-icon fas fa-chart-bar"></i>
                        System Analytics
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="cms">
                        <i class="nav-icon fas fa-edit"></i>
                        CMS
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="settings">
                        <i class="nav-icon fas fa-cog"></i>
                        System Settings
                    </a>
                </nav>
            </div>
            
            <!-- Main Content -->
            <div class="ml-64">
                <!-- Top Bar -->
                <header class="bg-white shadow-sm border-b">
                    <div class="flex justify-between items-center px-6 py-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800" id="page-title">Admin Dashboard</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-gray-500">
                                <i class="fas fa-shield-alt mr-1"></i>
                                Administrator Mode
                            </div>
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
    await loadAdminOverview();

    // Setup navigation
    setupAdminNavigation();
}

async function loadAdminOverview() {
    const content = document.getElementById('dashboard-content');
    
    try {
        const analytics = await AnalyticsService.getAdminAnalytics();

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-users text-xl"></i>
                        </div>
                        <div class="stat-value">${analytics.total_users}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-home text-xl"></i>
                        </div>
                        <div class="stat-value">${analytics.total_properties}</div>
                        <div class="stat-label">Properties</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-calendar-check text-xl"></i>
                        </div>
                        <div class="stat-value">${analytics.total_bookings}</div>
                        <div class="stat-label">Bookings</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-chart-line text-xl"></i>
                        </div>
                        <div class="stat-value">₦${analytics.total_revenue.toLocaleString()}</div>
                        <div class="stat-label">Platform Revenue</div>
                    </div>
                </div>
                
                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${ChartRenderer.createChartContainer('users-chart', 'User Growth')}
                    ${ChartRenderer.createChartContainer('properties-chart', 'Property Listings')}
                </div>
                
                <!-- User Distribution and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- User Distribution -->
                    <div class="lg:col-span-1">
                        ${ChartRenderer.createChartContainer('user-distribution-chart', 'User Distribution', '300px')}
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="lg:col-span-2">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="font-bold">Recent System Activity</h3>
                            </div>
                            <div class="card-body">
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-user-plus text-blue-600"></i>
                                            </div>
                                            <div>
                                                <div class="font-medium">New user registration</div>
                                                <div class="text-sm text-gray-500">2 minutes ago</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-info">User</span>
                                    </div>
                                    
                                    <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-home text-green-600"></i>
                                            </div>
                                            <div>
                                                <div class="font-medium">New property listed</div>
                                                <div class="text-sm text-gray-500">15 minutes ago</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-success">Property</span>
                                    </div>
                                    
                                    <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-credit-card text-yellow-600"></i>
                                            </div>
                                            <div>
                                                <div class="font-medium">Payment completed</div>
                                                <div class="text-sm text-gray-500">1 hour ago</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-warning">Payment</span>
                                    </div>
                                    
                                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-flag text-red-600"></i>
                                            </div>
                                            <div>
                                                <div class="font-medium">New report submitted</div>
                                                <div class="text-sm text-gray-500">2 hours ago</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-error">Report</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pending Actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-bold">Pending Approvals</h3>
                        </div>
                        <div class="card-body text-center">
                            <div class="text-3xl font-bold text-yellow-600 mb-2">5</div>
                            <p class="text-gray-600">Properties waiting verification</p>
                            <a href="#" class="btn btn-warning mt-4 w-full" data-dashboard-nav="approvals">
                                Review Now
                            </a>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-bold">Active Reports</h3>
                        </div>
                        <div class="card-body text-center">
                            <div class="text-3xl font-bold text-red-600 mb-2">3</div>
                            <p class="text-gray-600">Issues requiring attention</p>
                            <a href="#" class="btn btn-danger mt-4 w-full" data-dashboard-nav="reports">
                                View Reports
                            </a>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-bold">System Health</h3>
                        </div>
                        <div class="card-body text-center">
                            <div class="text-3xl font-bold text-green-600 mb-2">98%</div>
                            <p class="text-gray-600">All systems operational</p>
                            <div class="mt-4 space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span>API</span>
                                    <span class="text-green-600">✓</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span>Database</span>
                                    <span class="text-green-600">✓</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span>Storage</span>
                                    <span class="text-green-600">✓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.getElementById('page-title').textContent = 'Admin Overview';

        // Render charts
        setTimeout(() => {
            // User growth chart
            ChartRenderer.createLineChart('users-chart', {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [150, 230, 380, 520, 610, 750]
            }, {
                label: 'Total Users'
            });

            // Properties chart
            ChartRenderer.createBarChart('properties-chart', {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [45, 62, 78, 95, 110, 125]
            }, {
                label: 'Properties Listed'
            });

            // User distribution chart
            ChartRenderer.createPieChart('user-distribution-chart', {
                labels: ['Tenants', 'Agents', 'Landlords', 'Admins'],
                values: [520, 150, 75, 5]
            });

        }, 100);

    } catch (error) {
        console.error('Error loading admin overview:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-700 mb-2">Error Loading Dashboard</h2>
                <p class="text-gray-500">Please try refreshing the page</p>
            </div>
        `;
    }
}

function setupAdminNavigation() {
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
                        await loadAdminOverview();
                        break;
                    case 'users':
                        await loadUserManagementSection();
                        break;
                    case 'properties':
                        await loadAdminPropertiesSection();
                        break;
                    case 'approvals':
                        await loadApprovalsSection();
                        break;
                    case 'reports':
                        await loadReportsSection();
                        break;
                    case 'analytics':
                        await loadAdminAnalyticsSection();
                        break;
                    case 'cms':
                        await loadCMSSection();
                        break;
                    case 'settings':
                        await loadAdminSettingsSection();
                        break;
                    default:
                        await loadAdminOverview();
                }
            } catch (error) {
                console.error(`Error loading ${section}:`, error);
                showNotification(`Error loading ${section}`, 'error');
            }
        }
    });
}

async function loadUserManagementSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>User management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'User Management';
}

async function loadAdminPropertiesSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Property management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Property Management';
}

async function loadApprovalsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Approvals section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Listing Approvals';
}

async function loadReportsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Reports section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Reports & Issues';
}

async function loadAdminAnalyticsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Analytics section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'System Analytics';
}

async function loadCMSSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>CMS section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Content Management';
}

async function loadAdminSettingsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>System settings section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'System Settings';
}