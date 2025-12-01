import { supabase } from '../api/supabase-client.js';

export class RoleBasedAccess {
    static async canAccess(user, resource, action) {
        const userRole = await this.getUserRole(user.id);
        
        const permissions = {
            tenant: {
                properties: ['read', 'favorite'],
                bookings: ['create', 'read', 'update'],
                payments: ['read', 'create'],
                messages: ['read', 'create'],
                profile: ['read', 'update']
            },
            agent: {
                properties: ['create', 'read', 'update', 'delete'],
                bookings: ['read', 'update'],
                payments: ['read'],
                messages: ['read', 'create'],
                profile: ['read', 'update'],
                analytics: ['read']
            },
            landlord: {
                properties: ['create', 'read', 'update'],
                bookings: ['read'],
                payments: ['read'],
                messages: ['read', 'create'],
                profile: ['read', 'update'],
                analytics: ['read']
            },
            admin: {
                users: ['create', 'read', 'update', 'delete'],
                properties: ['create', 'read', 'update', 'delete', 'verify'],
                bookings: ['read', 'update', 'delete'],
                payments: ['read'],
                messages: ['read'],
                profile: ['read', 'update'],
                analytics: ['read'],
                system: ['manage']
            }
        };
        
        return permissions[userRole]?.[resource]?.includes(action) || false;
    }
    
    static async getUserRole(userId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
            
        return profile?.role || 'tenant';
    }
    
    static async isPropertyOwner(propertyId, userId) {
        const { data: property } = await supabase
            .from('properties')
            .select('agent_id, landlord_id')
            .eq('id', propertyId)
            .single();
            
        return property && (property.agent_id === userId || property.landlord_id === userId);
    }
    
    static async isAdmin(userId) {
        const role = await this.getUserRole(userId);
        return role === 'admin';
    }
    
    static async isAgent(userId) {
        const role = await this.getUserRole(userId);
        return role === 'agent';
    }
    
    static async isLandlord(userId) {
        const role = await this.getUserRole(userId);
        return role === 'landlord';
    }
    
    static async isTenant(userId) {
        const role = await this.getUserRole(userId);
        return role === 'tenant';
    }
}