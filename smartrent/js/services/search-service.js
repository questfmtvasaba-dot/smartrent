import { PropertyService } from '../api/properties.js';
import { showNotification } from '../utils/helpers.js';

export class SearchService {
    constructor() {
        this.filters = {
            location: '',
            property_type: '',
            min_price: '',
            max_price: '',
            bedrooms: '',
            bathrooms: '',
            amenities: [],
            sort_by: 'newest'
        };
        
        this.results = [];
        this.currentPage = 1;
        this.resultsPerPage = 12;
        this.totalResults = 0;
    }

    async search(filters = {}) {
        try {
            this.filters = { ...this.filters, ...filters };
            this.currentPage = 1;
            
            const results = await PropertyService.searchProperties(this.filters);
            this.results = results;
            this.totalResults = results.length;
            
            return this.getPaginatedResults();
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Error performing search', 'error');
            return [];
        }
    }

    async loadMore() {
        this.currentPage++;
        return this.getPaginatedResults();
    }

    getPaginatedResults() {
        const startIndex = (this.currentPage - 1) * this.resultsPerPage;
        const endIndex = startIndex + this.resultsPerPage;
        return this.results.slice(0, endIndex);
    }

    hasMoreResults() {
        return this.results.length > this.currentPage * this.resultsPerPage;
    }

    getFilters() {
        return { ...this.filters };
    }

    updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
    }

    clearFilters() {
        this.filters = {
            location: '',
            property_type: '',
            min_price: '',
            max_price: '',
            bedrooms: '',
            bathrooms: '',
            amenities: [],
            sort_by: 'newest'
        };
    }

    async getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        try {
            // This would typically call an API endpoint for suggestions
            // For now, we'll filter from recent searches or common locations
            const commonLocations = [
                'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
                'Lekki', 'Victoria Island', 'Ikoyi', 'Surulere', 'Gbagada'
            ];
            
            return commonLocations.filter(location =>
                location.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }

    async getPopularSearches() {
        return [
            { term: '2 bedroom apartment in Lagos', count: 1245 },
            { term: '3 bedroom flat in Abuja', count: 892 },
            { term: 'Studio apartment in VI', count: 756 },
            { term: 'Duplex in Lekki', count: 543 },
            { term: 'Self contain in Surulere', count: 432 }
        ];
    }

    async saveSearch(searchData) {
        try {
            // Save search to user's search history
            const searches = this.getSearchHistory();
            searches.unshift({
                ...searchData,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            
            // Keep only last 10 searches
            const limitedSearches = searches.slice(0, 10);
            localStorage.setItem('smartrent_search_history', JSON.stringify(limitedSearches));
        } catch (error) {
            console.error('Error saving search:', error);
        }
    }

    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('smartrent_search_history') || '[]');
        } catch (error) {
            return [];
        }
    }

    clearSearchHistory() {
        localStorage.removeItem('smartrent_search_history');
    }

    // Geospatial search methods
    async searchByLocation(lat, lng, radiusKm = 10) {
        try {
            // This would use PostGIS for geospatial queries
            // For now, we'll simulate with existing search
            const results = await PropertyService.searchProperties({
                ...this.filters,
                near_location: { lat, lng, radius: radiusKm }
            });
            
            return results;
        } catch (error) {
            console.error('Geospatial search error:', error);
            return [];
        }
    }

    // Advanced filtering
    async applyAdvancedFilters(advancedFilters) {
        this.filters = { ...this.filters, ...advancedFilters };
        return this.search();
    }
}