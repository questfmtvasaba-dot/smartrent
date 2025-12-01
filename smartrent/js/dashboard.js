import { initializeApp, supabase } from './api/supabase-client.js';
import { loadNavbar } from './components/navbar.js';
import { checkAuth, getUserRole } from './auth/auth.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const user = await checkAuth();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Initialize app
    await initializeApp();
    
    // Load dashboard based on user role
    const role = await getUserRole();
    await loadDashboard(role);
    
    // Setup dashboard navigation
    setupDashboardNavigation();
});

async function loadDashboard(role) {
    const app = document.getElementById('dashboard-app');
    
    try {
        switch (role) {
            case 'tenant':
                const { loadTenantDashboard } = await import('./pages/tenant-dashboard.js');
                await loadTenantDashboard();
                break;
            case 'agent':
                const { loadAgentDashboard } = await import('./pages/agent-dashboard.js');
                await loadAgentDashboard();
                break;
            case 'landlord':
                const { loadLandlordDashboard } = await import('./pages/landlord-dashboard.js');
                await loadLandlordDashboard();
                break;
            case 'admin':
                const { loadAdminDashboard } = await import('./pages/admin-dashboard.js');
                await loadAdminDashboard();
                break;
            default:
                app.innerHTML = `
                    <div class="text-center py-20">
                        <h1 class="text-2xl font-bold text-gray-600">Unauthorized Access</h1>
                        <p class="text-gray-500 mt-2">Your account role is not recognized.</p>
                    </div>
                `;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        app.innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-600">Error Loading Dashboard</h1>
                <p class="text-gray-500 mt-2">Please try refreshing the page.</p>
            </div>
        `;
    }
}

function setupDashboardNavigation() {
    // Handle sidebar navigation
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-dashboard-nav]') || e.target.closest('[data-dashboard-nav]')) {
            e.preventDefault();
            const section = e.target.closest('[data-dashboard-nav]').getAttribute('data-dashboard-nav');
            navigateToSection(section);
        }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
        });
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }
    }
}

function navigateToSection(section) {
    // Update active nav item
    document.querySelectorAll('[data-dashboard-nav]').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-dashboard-nav="${section}"]`).classList.add('active');
    
    // Load section content
    const contentArea = document.getElementById('dashboard-content');
    contentArea.innerHTML = `<div class="loading-spinner mx-auto mt-10"></div>`;
    
    // Simulate loading different sections
    setTimeout(() => {
        loadSectionContent(section, contentArea);
    }, 500);
}

async function loadSectionContent(section, contentArea) {
    // This would be implemented in each dashboard module
    console.log(`Loading section: ${section}`);
    // Implementation would go in respective dashboard files
}