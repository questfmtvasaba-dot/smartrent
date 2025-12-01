import { PropertyService } from '../api/properties.js';
import { showNotification } from '../utils/helpers.js';

export class PropertyCard {
    constructor(property, options = {}) {
        this.property = property;
        this.options = {
            showActions: true,
            showAgent: true,
            showStatus: true,
            ...options
        };
    }

    render() {
        const {
            id,
            title,
            address,
            price,
            bedrooms,
            bathrooms,
            area_sqft,
            property_type,
            is_verified,
            is_available,
            profiles,
            property_images
        } = this.property;

        const primaryImage = property_images && property_images.length > 0 
            ? property_images[0].image_url 
            : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

        return `
            <div class="property-card card fade-in" data-property-id="${id}">
                <div class="property-image relative overflow-hidden rounded-t-lg" style="background-image: url('${primaryImage}')">
                    <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                    
                    <!-- Property Badges -->
                    <div class="absolute top-3 left-3 flex flex-col space-y-2">
                        ${is_verified ? `
                            <span class="badge badge-success">
                                <i class="fas fa-shield-alt mr-1"></i>Verified
                            </span>
                        ` : ''}
                        ${!is_available ? `
                            <span class="badge badge-error">
                                <i class="fas fa-times mr-1"></i>Unavailable
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- Price -->
                    <div class="absolute top-3 right-3">
                        <span class="bg-white px-3 py-1 rounded-full text-lg font-bold text-blue-600">
                            ₦${price?.toLocaleString()}/month
                        </span>
                    </div>
                    
                    <!-- Favorite Button -->
                    ${this.options.showActions ? `
                        <button class="absolute bottom-3 right-3 favorite-btn w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition"
                                data-property-id="${id}">
                            <i class="far fa-heart text-gray-400 hover:text-red-500"></i>
                        </button>
                    ` : ''}
                </div>
                
                <div class="card-body">
                    <h3 class="text-xl font-bold text-gray-800 mb-2 text-truncate">${title}</h3>
                    
                    <p class="text-gray-600 mb-3 flex items-center">
                        <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                        <span class="text-truncate">${address}</span>
                    </p>
                    
                    <div class="property-features mb-4">
                        <span><i class="fas fa-bed text-blue-500"></i> ${bedrooms} beds</span>
                        <span><i class="fas fa-bath text-blue-500"></i> ${bathrooms} baths</span>
                        <span><i class="fas fa-ruler-combined text-blue-500"></i> ${area_sqft} sqft</span>
                    </div>
                    
                    <div class="flex justify-between items-center mb-4">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            ${property_type}
                        </span>
                        
                        ${this.options.showAgent && profiles ? `
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-user-tie mr-2 text-blue-500"></i>
                                <span>${profiles.full_name}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${this.options.showActions ? `
                        <div class="flex space-x-2">
                            <button class="btn btn-primary flex-1 view-property" data-property-id="${id}">
                                <i class="fas fa-eye mr-2"></i>View Details
                            </button>
                            <button class="btn btn-secondary message-agent" data-property-id="${id}" data-agent-id="${profiles?.id}">
                                <i class="fas fa-envelope"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    static setupEventListeners(container) {
        // View property details
        container.addEventListener('click', async (e) => {
            if (e.target.closest('.view-property')) {
                const button = e.target.closest('.view-property');
                const propertyId = button.getAttribute('data-property-id');
                await PropertyCard.showPropertyDetails(propertyId);
            }
            
            // Favorite property
            if (e.target.closest('.favorite-btn')) {
                const button = e.target.closest('.favorite-btn');
                const propertyId = button.getAttribute('data-property-id');
                await PropertyCard.toggleFavorite(propertyId, button);
            }
            
            // Message agent
            if (e.target.closest('.message-agent')) {
                const button = e.target.closest('.message-agent');
                const propertyId = button.getAttribute('data-property-id');
                const agentId = button.getAttribute('data-agent-id');
                await PropertyCard.startChat(propertyId, agentId);
            }
        });
    }

    static async showPropertyDetails(propertyId) {
        try {
            const property = await PropertyService.getPropertyById(propertyId);
            if (!property) {
                showNotification('Property not found', 'error');
                return;
            }

            // Create and show property details modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = this.createPropertyModalHTML(property);
            
            document.body.appendChild(modal);
            this.setupPropertyModalEvents(modal, property);
            
        } catch (error) {
            console.error('Error showing property details:', error);
            showNotification('Error loading property details', 'error');
        }
    }

    static createPropertyModalHTML(property) {
        const {
            id,
            title,
            description,
            address,
            price,
            bedrooms,
            bathrooms,
            area_sqft,
            property_type,
            amenities,
            is_verified,
            profiles,
            property_images
        } = property;

        const images = property_images || [];
        const primaryImage = images.length > 0 ? images[0].image_url : '';

        return `
            <div class="modal-content max-w-4xl">
                <div class="modal-header">
                    <h2 class="text-2xl font-bold">${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Image Gallery -->
                    <div class="mb-6">
                        <div class="h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden mb-4">
                            <img src="${primaryImage}" alt="${title}" class="w-full h-full object-cover">
                        </div>
                        
                        ${images.length > 1 ? `
                            <div class="grid grid-cols-4 gap-2">
                                ${images.slice(0, 4).map(img => `
                                    <div class="h-20 bg-gray-200 rounded overflow-hidden">
                                        <img src="${img.image_url}" alt="${title}" class="w-full h-full object-cover">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Property Details -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div class="md:col-span-2">
                            <h3 class="text-xl font-bold mb-4">Property Details</h3>
                            
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div class="text-center p-4 bg-blue-50 rounded-lg">
                                    <div class="text-2xl font-bold text-blue-600">${bedrooms}</div>
                                    <div class="text-gray-600">Bedrooms</div>
                                </div>
                                <div class="text-center p-4 bg-green-50 rounded-lg">
                                    <div class="text-2xl font-bold text-green-600">${bathrooms}</div>
                                    <div class="text-gray-600">Bathrooms</div>
                                </div>
                                <div class="text-center p-4 bg-purple-50 rounded-lg">
                                    <div class="text-2xl font-bold text-purple-600">${area_sqft}</div>
                                    <div class="text-gray-600">Sq Ft</div>
                                </div>
                            </div>
                            
                            ${description ? `
                                <div class="mb-6">
                                    <h4 class="font-bold mb-2">Description</h4>
                                    <p class="text-gray-700">${description}</p>
                                </div>
                            ` : ''}
                            
                            ${amenities && amenities.length > 0 ? `
                                <div class="mb-6">
                                    <h4 class="font-bold mb-2">Amenities</h4>
                                    <div class="flex flex-wrap gap-2">
                                        ${amenities.map(amenity => `
                                            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                ${amenity}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Sidebar -->
                        <div class="space-y-6">
                            <!-- Price Card -->
                            <div class="card">
                                <div class="card-body">
                                    <div class="text-3xl font-bold text-blue-600 mb-2">
                                        ₦${price?.toLocaleString()}
                                    </div>
                                    <div class="text-gray-600 mb-4">per month</div>
                                    
                                    <button class="btn btn-primary w-full mb-3" id="book-inspection">
                                        <i class="fas fa-calendar-check mr-2"></i>Book Inspection
                                    </button>
                                    
                                    <button class="btn btn-secondary w-full" id="contact-agent">
                                        <i class="fas fa-envelope mr-2"></i>Contact Agent
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Agent Card -->
                            ${profiles ? `
                                <div class="card">
                                    <div class="card-body">
                                        <h4 class="font-bold mb-3">Listed By</h4>
                                        <div class="flex items-center space-x-3">
                                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-user-tie text-blue-600"></i>
                                            </div>
                                            <div>
                                                <div class="font-bold">${profiles.full_name}</div>
                                                <div class="text-sm text-gray-600">Real Estate Agent</div>
                                            </div>
                                        </div>
                                        
                                        <div class="mt-4 space-y-2">
                                            <button class="btn btn-outline w-full">
                                                <i class="fas fa-phone mr-2"></i>Call Agent
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static setupPropertyModalEvents(modal, property) {
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Book inspection
        const bookBtn = modal.querySelector('#book-inspection');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                PropertyCard.bookInspection(property);
            });
        }
        
        // Contact agent
        const contactBtn = modal.querySelector('#contact-agent');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                PropertyCard.contactAgent(property);
            });
        }
    }

    static async toggleFavorite(propertyId, button) {
        try {
            const user = await import('../auth/auth.js').then(mod => mod.checkAuth());
            if (!user) {
                showNotification('Please login to add favorites', 'warning');
                return;
            }
            
            const { favorited } = await PropertyService.toggleFavorite(propertyId, user.id);
            
            const icon = button.querySelector('i');
            if (favorited) {
                icon.className = 'fas fa-heart text-red-500';
                showNotification('Added to favorites', 'success');
            } else {
                icon.className = 'far fa-heart text-gray-400';
                showNotification('Removed from favorites', 'info');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showNotification('Error updating favorites', 'error');
        }
    }

    static async bookInspection(property) {
        // This would open a booking modal
        showNotification('Booking feature coming soon!', 'info');
    }

    static async contactAgent(property) {
        // This would open a chat modal
        showNotification('Chat feature coming soon!', 'info');
    }

    static async startChat(propertyId, agentId) {
        // This would start a chat with the agent
        showNotification('Starting chat with agent...', 'info');
    }
}