import { PropertyService } from '../api/properties.js';
import { PaymentService } from '../api/payments.js';
import { AnalyticsService } from '../services/analytics-service.js';
import { ChartRenderer } from '../components/charts.js';
import { showNotification } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserProfile } from '../api/supabase-client.js';

export async function loadLandlordDashboard() {
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
                        <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-building"></i>
                        </div>
                        <div>
                            <div class="font-bold">${profile?.full_name || 'Landlord'}</div>
                            <div class="text-sm text-gray-500">Property Owner</div>
                        </div>
                    </div>
                </div>
                
                <nav class="sidebar-nav p-4">
                    <a href="#" class="nav-link active" data-dashboard-nav="overview">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        Overview
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="properties">
                        <i class="nav-icon fas fa-home"></i>
                        My Properties
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="add-property">
                        <i class="nav-icon fas fa-plus"></i>
                        Register Property
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="tenants">
                        <i class="nav-icon fas fa-users"></i>
                        Tenants
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="payments">
                        <i class="nav-icon fas fa-credit-card"></i>
                        Payments
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="analytics">
                        <i class="nav-icon fas fa-chart-bar"></i>
                        Analytics
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
                            <h1 class="text-2xl font-bold text-gray-800" id="page-title">Landlord Dashboard</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <button class="btn btn-primary">
                                <i class="fas fa-plus mr-2"></i>Register Property
                            </button>
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
    await loadLandlordOverview();

    // Setup navigation
    setupLandlordNavigation();
}

async function loadLandlordOverview() {
    const content = document.getElementById('dashboard-content');
    const user = await getCurrentUser();
    
    try {
        const [payments, paymentStats, analytics] = await Promise.all([
            PaymentService.getLandlordPayments(user.id),
            PaymentService.getPaymentStats(user.id, 'landlord'),
            AnalyticsService.getUserAnalytics(user.id, 'landlord')
        ]);

        const totalRevenue = paymentStats.totalAmount || 0;
        const pendingPayments = paymentStats.pending || 0;
        const occupancyRate = analytics.properties > 0 ? Math.round((analytics.properties - 1) / analytics.properties * 100) : 0; // Mock occupancy

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-home text-xl"></i>
                        </div>
                        <div class="stat-value">${analytics.properties}</div>
                        <div class="stat-label">Properties</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-user-check text-xl"></i>
                        </div>
                        <div class="stat-value">${analytics.properties - 1}</div>
                        <div class="stat-label">Occupied Units</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-clock text-xl"></i>
                        </div>
                        <div class="stat-value">${pendingPayments}</div>
                        <div class="stat-label">Pending Payments</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-chart-line text-xl"></i>
                        </div>
                        <div class="stat-value">₦${totalRevenue.toLocaleString()}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
                
                <!-- Charts and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Revenue Chart -->
                    <div class="lg:col-span-2">
                        ${ChartRenderer.createChartContainer('revenue-chart', 'Revenue Overview', '300px')}
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="space-y-4">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="font-bold mb-3">Portfolio Overview</h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Occupancy Rate</span>
                                        <span class="font-bold">${occupancyRate}%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Monthly Revenue</span>
                                        <span class="font-bold text-green-600">₦${Math.round(totalRevenue / 12).toLocaleString()}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Active Tenants</span>
                                        <span class="font-bold">${analytics.properties - 1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body">
                                <h4 class="font-bold mb-3">Quick Actions</h4>
                                <div class="space-y-2">
                                    <a href="#" class="block btn btn-sm btn-primary w-full text-center" data-dashboard-nav="add-property">
                                        <i class="fas fa-plus mr-2"></i>Register Property
                                    </a>
                                    <a href="#" class="block btn btn-sm btn-secondary w-full text-center" data-dashboard-nav="payments">
                                        <i class="fas fa-credit-card mr-2"></i>View Payments
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Payments -->
                <div class="card">
                    <div class="card-header flex justify-between items-center">
                        <h3 class="font-bold">Recent Payments</h3>
                        <a href="#" class="text-blue-600 hover:underline" data-dashboard-nav="payments">
                            View All
                        </a>
                    </div>
                    <div class="card-body">
                        ${payments.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Tenant</th>
                                            <th>Property</th>
                                            <th>Amount</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${payments.slice(0, 5).map(payment => `
                                            <tr>
                                                <td>
                                                    <div class="font-medium">${payment.tenant?.full_name || 'Unknown Tenant'}</div>
                                                    <div class="text-sm text-gray-500">${payment.tenant?.email || ''}</div>
                                                </td>
                                                <td>
                                                    <div class="font-medium">${payment.property?.title || 'Unknown Property'}</div>
                                                    <div class="text-sm text-gray-500">${payment.property?.address || ''}</div>
                                                </td>
                                                <td class="font-bold">₦${payment.amount?.toLocaleString()}</td>
                                                <td>${payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <span class="badge ${payment.status === 'completed' ? 'badge-success' : 
                                                        payment.status === 'pending' ? 'badge-warning' : 'badge-error'}">
                                                        ${payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-credit-card text-3xl text-gray-300 mb-3"></i>
                                <p>No payment history</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.getElementById('page-title').textContent = 'Landlord Overview';

        // Render chart
        setTimeout(() => {
            ChartRenderer.createLineChart('revenue-chart', {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [450000, 520000, 480000, 610000, 580000, 650000]
            }, {
                label: 'Monthly Revenue (₦)'
            });
        }, 100);

    } catch (error) {
        console.error('Error loading landlord overview:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-700 mb-2">Error Loading Dashboard</h2>
                <p class="text-gray-500">Please try refreshing the page</p>
            </div>
        `;
    }
}

function setupLandlordNavigation() {
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
                        await loadLandlordOverview();
                        break;
                    case 'properties':
                        await loadLandlordPropertiesSection();
                        break;
                    case 'add-property':
                        await loadLandlordAddPropertySection();
                        break;
                    case 'tenants':
                        await loadTenantsSection();
                        break;
                    case 'payments':
                        await loadLandlordPaymentsSection();
                        break;
                    case 'analytics':
                        await loadLandlordAnalyticsSection();
                        break;
                    case 'profile':
                        await loadLandlordProfileSection();
                        break;
                    default:
                        await loadLandlordOverview();
                }
            } catch (error) {
                console.error(`Error loading ${section}:`, error);
                showNotification(`Error loading ${section}`, 'error');
            }
        }
    });
}

async function loadLandlordPropertiesSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Properties management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'My Properties';
}

async function loadLandlordAddPropertySection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Add property section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Register Property';
}

async function loadTenantsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Tenants management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Tenants';
}

async function loadLandlordPaymentsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Payments section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Payment History';
}

async function loadLandlordAnalyticsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Analytics section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Portfolio Analytics';
}

async function loadLandlordProfileSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Profile section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Profile Settings';
}