import { supabase } from './supabase-client.js';

export class PropertyService {
    static async getFeaturedProperties(limit = 6) {
        try {
            console.log('Fetching featured properties...');
            
            // If Supabase isn't configured, return mock data
            if (!supabase) {
                console.warn('Supabase not configured, returning mock data');
                return this.getMockProperties(limit);
            }

            const { data: properties, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    profiles:agent_id(full_name, avatar_url),
                    property_images(*)
                `)
                .eq('is_verified', true)
                .eq('is_available', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching properties from Supabase:', error);
                return this.getMockProperties(limit);
            }

            console.log(`Found ${properties?.length || 0} properties`);
            return properties || [];
        } catch (error) {
            console.error('Error in getFeaturedProperties:', error);
            return this.getMockProperties(limit);
        }
    }

    static getMockProperties(limit = 6) {
        const mockProperties = [
            {
                id: 1,
                title: 'Modern Apartment in Lekki',
                description: 'Beautiful modern apartment with great amenities',
                address: 'Lekki Phase 1, Lagos',
                price: 1500000,
                bedrooms: 3,
                bathrooms: 2,
                area_sqft: 1200,
                property_type: 'apartment',
                amenities: ['wifi', 'parking', 'ac', 'security'],
                is_verified: true,
                is_available: true,
                profiles: {
                    full_name: 'John Agent'
                },
                property_images: [
                    {
                        image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    }
                ],
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Luxury Villa in Victoria Island',
                description: 'Spacious luxury villa with swimming pool',
                address: 'Victoria Island, Lagos',
                price: 4500000,
                bedrooms: 5,
                bathrooms: 4,
                area_sqft: 2800,
                property_type: 'villa',
                amenities: ['wifi', 'parking', 'pool', 'gym', 'security'],
                is_verified: true,
                is_available: true,
                profiles: {
                    full_name: 'Sarah Properties'
                },
                property_images: [
                    {
                        image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    }
                ],
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Cozy Studio Apartment',
                description: 'Perfect studio apartment for singles',
                address: 'Surulere, Lagos',
                price: 800000,
                bedrooms: 1,
                bathrooms: 1,
                area_sqft: 600,
                property_type: 'studio',
                amenities: ['wifi', 'ac', 'furnished'],
                is_verified: true,
                is_available: true,
                profiles: {
                    full_name: 'Mike Realty'
                },
                property_images: [
                    {
                        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                    }
                ],
                created_at: new Date().toISOString()
            }
        ];

        return mockProperties.slice(0, limit);
    }

    // ... rest of the methods remain the same
}