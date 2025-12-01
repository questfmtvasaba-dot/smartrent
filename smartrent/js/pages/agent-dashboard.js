import { PropertyService } from '../api/properties.js';
import { AnalyticsService } from '../services/analytics-service.js';
import { ChartRenderer } from '../components/charts.js';
import { showNotification } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserProfile } from '../api/supabase-client.js';

export async function loadAgentDashboard() {
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
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <div class="font-bold">${profile?.full_name || 'Agent'}</div>
                            <div class="text-sm text-gray-500">Real Estate Agent</div>
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
                        Add Property
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="leads">
                        <i class="nav-icon fas fa-users"></i>
                        Leads & Bookings
                    </a>
                    <a href="#" class="nav-link" data-dashboard-nav="messages">
                        <i class="nav-icon fas fa-envelope"></i>
                        Messages
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
                            <h1 class="text-2xl font-bold text-gray-800" id="page-title">Agent Dashboard</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <button class="btn btn-primary">
                                <i class="fas fa-plus mr-2"></i>Add Property
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
    await loadAgentOverview();

    // Setup navigation
    setupAgentNavigation();
}

async function loadAgentOverview() {
    const content = document.getElementById('dashboard-content');
    const user = await getCurrentUser();
    
    try {
        const [properties, analytics] = await Promise.all([
            PropertyService.getAgentProperties(user.id),
            AnalyticsService.getUserAnalytics(user.id, 'agent')
        ]);

        const activeProperties = properties.filter(p => p.is_available).length;
        const totalInquiries = analytics.bookings || 0;
        const totalRevenue = analytics.revenue || 0;

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-home text-xl"></i>
                        </div>
                        <div class="stat-value">${properties.length}</div>
                        <div class="stat-label">Total Properties</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle text-xl"></i>
                        </div>
                        <div class="stat-value">${activeProperties}</div>
                        <div class="stat-label">Active Listings</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-users text-xl"></i>
                        </div>
                        <div class="stat-value">${totalInquiries}</div>
                        <div class="stat-label">Total Inquiries</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-chart-line text-xl"></i>
                        </div>
                        <div class="stat-value">₦${totalRevenue.toLocaleString()}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
                
                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${ChartRenderer.createChartContainer('views-chart', 'Property Views (Last 30 Days')}
                    ${ChartRenderer.createChartContainer('inquiries-chart', 'Inquiry Trends')}
                </div>
                
                <!-- Recent Properties -->
                <div class="card">
                    <div class="card-header flex justify-between items-center">
                        <h3 class="font-bold">Recent Properties</h3>
                        <a href="#" class="text-blue-600 hover:underline" data-dashboard-nav="properties">
                            View All
                        </a>
                    </div>
                    <div class="card-body">
                        ${properties.length > 0 ? `
                            <div class="overflow-x-auto">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Property</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                            <th>Inquiries</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${properties.slice(0, 5).map(property => `
                                            <tr>
                                                <td>
                                                    <div class="flex items-center space-x-3">
                                                        <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                                                            <img src="${property.property_images && property.property_images.length > 0 ? 
                                                                property.property_images[0].image_url : 
                                                                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" 
                                                                alt="${property.title}" class="w-full h-full object-cover rounded-lg">
                                                        </div>
                                                        <div>
                                                            <div class="font-medium">${property.title}</div>
                                                            <div class="text-sm text-gray-500">${property.address}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span class="badge ${property.is_available ? 'badge-success' : 'badge-error'}">
                                                        ${property.is_available ? 'Available' : 'Rented'}
                                                    </span>
                                                    ${property.is_verified ? `
                                                        <span class="badge badge-success ml-1">Verified</span>
                                                    ` : `
                                                        <span class="badge badge-warning ml-1">Pending</span>
                                                    `}
                                                </td>
                                                <td class="font-bold">₦${property.price?.toLocaleString()}</td>
                                                <td>${property.bookings?.[0]?.count || 0}</td>
                                                <td>
                                                    <div class="flex space-x-2">
                                                        <button class="btn btn-sm btn-secondary" data-property-id="${property.id}">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" data-property-id="${property.id}">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-home text-3xl text-gray-300 mb-3"></i>
                                <p>No properties listed yet</p>
                                <a href="#" class="btn btn-primary mt-4" data-dashboard-nav="add-property">
                                    <i class="fas fa-plus mr-2"></i>Add Your First Property
                                </a>
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-bold">Quick Actions</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 transition" data-dashboard-nav="add-property">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-plus text-green-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Add Property</div>
                                    <div class="text-sm text-gray-500">Create new listing</div>
                                </div>
                            </a>
                            
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition" data-dashboard-nav="leads">
                                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-users text-blue-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Manage Leads</div>
                                    <div class="text-sm text-gray-500">View inquiries & bookings</div>
                                </div>
                            </a>
                            
                            <a href="#" class="flex items-center p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-200 transition" data-dashboard-nav="analytics">
                                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-chart-bar text-purple-600"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Analytics</div>
                                    <div class="text-sm text-gray-500">View performance metrics</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.getElementById('page-title').textContent = 'Agent Overview';

        // Render charts
        setTimeout(() => {
            ChartRenderer.createBarChart('views-chart', {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                values: [12, 19, 8, 15, 12, 18, 14]
            }, {
                label: 'Property Views'
            });

            ChartRenderer.createLineChart('inquiries-chart', {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                values: [4, 7, 12, 8]
            }, {
                label: 'Inquiries'
            });
        }, 100);

    } catch (error) {
        console.error('Error loading agent overview:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-700 mb-2">Error Loading Dashboard</h2>
                <p class="text-gray-500">Please try refreshing the page</p>
            </div>
        `;
    }
}

function setupAgentNavigation() {
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
                        await loadAgentOverview();
                        break;
                    case 'properties':
                        await loadAgentPropertiesSection();
                        break;
                    case 'add-property':
                        await loadAddPropertySection();
                        break;
                    case 'leads':
                        await loadLeadsSection();
                        break;
                    case 'messages':
                        await loadAgentMessagesSection();
                        break;
                    case 'analytics':
                        await loadAnalyticsSection();
                        break;
                    case 'profile':
                        await loadAgentProfileSection();
                        break;
                    default:
                        await loadAgentOverview();
                }
            } catch (error) {
                console.error(`Error loading ${section}:`, error);
                showNotification(`Error loading ${section}`, 'error');
            }
        }
    });
}

async function loadAgentPropertiesSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Properties management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'My Properties';
}

async function loadAddPropertySection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Add property section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Add Property';
}

async function loadLeadsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Leads management section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Leads & Bookings';
}

async function loadAgentMessagesSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Messages section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Messages';
}

async function loadAnalyticsSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Analytics section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Analytics';
}

async function loadAgentProfileSection() {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = `<div class="text-center py-12"><p>Profile section coming soon...</p></div>`;
    document.getElementById('page-title').textContent = 'Profile Settings';
}