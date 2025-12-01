import { PropertyService } from '../api/properties.js';

export async function loadHomePage() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }

    console.log('Loading home page...');
    
    try {
        // Load basic home page structure first
        mainContent.innerHTML = getHomePageHTML();
        
        // Then load properties asynchronously
        await loadFeaturedProperties();
        
        // Setup event listeners
        setupHomePageEvents();
        
    } catch (error) {
        console.error('Error loading home page:', error);
        mainContent.innerHTML = getErrorHTML('Failed to load home page. Please refresh.');
    }
}

function getHomePageHTML() {
    return `
        <!-- Hero Section -->
        <section class="gradient-bg text-white py-20">
            <div class="container mx-auto px-4">
                <div class="max-w-3xl mx-auto text-center">
                    <h1 class="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Rental Property</h1>
                    <p class="text-xl mb-8">SmartRent connects tenants, agents, and landlords in a seamless rental experience</p>
                    
                    <!-- Search Bar -->
                    <div class="bg-white rounded-lg p-2 shadow-lg">
                        <div class="flex flex-col md:flex-row gap-2">
                            <div class="flex-1 relative">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" placeholder="Search by location, property type..." 
                                       class="w-full pl-10 p-3 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <select class="p-3 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Property Type</option>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="condo">Condo</option>
                                <option value="studio">Studio</option>
                            </select>
                            <select class="p-3 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Price Range</option>
                                <option value="0-500000">Under ₦500k</option>
                                <option value="500000-1000000">₦500k - ₦1M</option>
                                <option value="1000000-2000000">₦1M - ₦2M</option>
                                <option value="2000000+">₦2M+</option>
                            </select>
                            <button class="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium">
                                <i class="fas fa-search mr-2"></i>Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured Properties -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Featured Properties</h2>
                
                <div id="featured-properties" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="col-span-3 flex justify-center py-12">
                        <div class="loading-spinner"></div>
                        <span class="ml-3 text-gray-600">Loading properties...</span>
                    </div>
                </div>
                
                <div class="text-center mt-12">
                    <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                        View All Properties
                    </button>
                </div>
            </div>
        </section>

        <!-- How It Works -->
        <section class="py-16 bg-gray-100">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">How SmartRent Works</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-xl shadow-md text-center">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-search text-blue-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Find Properties</h3>
                        <p class="text-gray-600">Browse verified listings with advanced search and filtering options.</p>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-md text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-calendar-check text-green-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Book Inspections</h3>
                        <p class="text-gray-600">Schedule property viewings directly with agents or landlords.</p>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-md text-center">
                        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-file-contract text-purple-600 text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold mb-3">Rent & Manage</h3>
                        <p class="text-gray-600">Complete rental agreements, pay rent, and manage your tenancy.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- User Role Benefits -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">SmartRent For Everyone</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <h3 class="text-lg font-bold">Tenants</h3>
                        </div>
                        <ul class="text-gray-700 space-y-2">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Browse verified properties</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Book inspections online</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Pay rent securely</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Chat with agents</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-6 rounded-xl border border-green-100">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-user-tie text-white"></i>
                            </div>
                            <h3 class="text-lg font-bold">Agents</h3>
                        </div>
                        <ul class="text-gray-700 space-y-2">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>List properties easily</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Manage leads & bookings</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Track performance</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Commission tracking</li>
                        </ul>
                    </div>
                    
                    <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-building text-white"></i>
                            </div>
                            <h3 class="text-lg font-bold">Landlords</h3>
                        </div>
                        <ul class="text-gray-700 space-y-2">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Register properties</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Assign agents</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Track payments</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Revenue analytics</li>
                        </ul>
                    </div>
                    
                    <div class="bg-red-50 p-6 rounded-xl border border-red-100">
                        <div class="flex items-center mb-4">
                            <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-cog text-white"></i>
                            </div>
                            <h3 class="text-lg font-bold">Admins</h3>
                        </div>
                        <ul class="text-gray-700 space-y-2">
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Manage all users</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Approve listings</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>Monitor platform</li>
                            <li><i class="fas fa-check text-green-500 mr-2"></i>System analytics</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-16 gradient-bg text-white">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                <p class="text-xl mb-8 max-w-2xl mx-auto">Join thousands of users who are already managing their rental properties with SmartRent.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition" data-auth-modal>
                        Sign Up as Tenant
                    </button>
                    <button class="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition" data-auth-modal>
                        List Your Property
                    </button>
                </div>
            </div>
        </section>
    `;
}

function getErrorHTML(message) {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Page Load Error</h1>
                <p class="text-gray-600 mb-4">${message}</p>
                <button onclick="window.location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Reload Page
                </button>
            </div>
        </div>
    `;
}

async function loadFeaturedProperties() {
    const container = document.getElementById('featured-properties');
    
    if (!container) {
        console.error('Featured properties container not found');
        return;
    }

    try {
        console.log('Loading featured properties...');
        const properties = await PropertyService.getFeaturedProperties(6);
        
        if (properties && properties.length > 0) {
            container.innerHTML = properties.map(property => `
                <div class="property-card bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="h-48 bg-gray-200 relative overflow-hidden">
                        <img src="${property.property_images && property.property_images.length > 0 ? 
                            property.property_images[0].image_url : 
                            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}" 
                            alt="${property.title}" class="w-full h-full object-cover">
                        <div class="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-sm font-bold text-blue-600">
                            ₦${property.price ? property.price.toLocaleString() : '0'}/month
                        </div>
                        ${property.is_verified ? `
                            <div class="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                <i class="fas fa-shield-alt mr-1"></i>Verified
                            </div>
                        ` : ''}
                    </div>
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-bold text-gray-800">${property.title}</h3>
                        </div>
                        <p class="text-gray-600 mb-4">
                            <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                            ${property.address}
                        </p>
                        <div class="flex items-center text-sm text-gray-500 mb-4">
                            <span class="mr-4">
                                <i class="fas fa-bed mr-1"></i> ${property.bedrooms || 0} beds
                            </span>
                            <span class="mr-4">
                                <i class="fas fa-bath mr-1"></i> ${property.bathrooms || 0} baths
                            </span>
                            <span>
                                <i class="fas fa-ruler-combined mr-1"></i> ${property.area_sqft || 0} sqft
                            </span>
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-user-tie mr-2 text-blue-500"></i>
                                <span>${property.profiles?.full_name || 'SmartRent Agent'}</span>
                            </div>
                        </div>
                        <button class="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition view-property" data-id="${property.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to view property buttons
            document.querySelectorAll('.view-property').forEach(button => {
                button.addEventListener('click', function() {
                    const propertyId = this.getAttribute('data-id');
                    showNotification('Property details feature coming soon!', 'info');
                });
            });
        } else {
            container.innerHTML = `
                <div class="col-span-3 text-center py-12">
                    <i class="fas fa-home text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">No Properties Available</h3>
                    <p class="text-gray-500">Check back later for new listings.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading featured properties:', error);
        container.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-600 mb-2">Error Loading Properties</h3>
                <p class="text-gray-500">Please try again later.</p>
            </div>
        `;
    }
}

function setupHomePageEvents() {
    // Auth modal buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-auth-modal]') || e.target.closest('[data-auth-modal]')) {
            e.preventDefault();
            showNotification('Authentication feature coming soon!', 'info');
        }
    });

    // Search form
    const searchForm = document.querySelector('.gradient-bg form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Search feature coming soon!', 'info');
        });
    }
}