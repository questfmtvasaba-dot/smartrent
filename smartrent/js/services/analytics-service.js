import { supabase } from '../api/supabase-client.js';

export class AnalyticsService {
    static async getPropertyAnalytics(propertyId, period = '30d') {
        try {
            const { data: views, error: viewsError } = await supabase
                .from('property_views')
                .select('*')
                .eq('property_id', propertyId)
                .gte('viewed_at', this.getDateRange(period));

            const { data: inquiries, error: inquiriesError } = await supabase
                .from('bookings')
                .select('*')
                .eq('property_id', propertyId)
                .gte('created_at', this.getDateRange(period));

            if (viewsError || inquiriesError) throw viewsError || inquiriesError;

            return {
                total_views: views?.length || 0,
                total_inquiries: inquiries?.length || 0,
                views_data: this.groupByDate(views, 'viewed_at'),
                inquiries_data: this.groupByDate(inquiries, 'created_at')
            };
        } catch (error) {
            console.error('Error fetching property analytics:', error);
            return { total_views: 0, total_inquiries: 0, views_data: [], inquiries_data: [] };
        }
    }

    static async getUserAnalytics(userId, userRole, period = '30d') {
        try {
            let propertiesQuery, bookingsQuery, paymentsQuery;

            if (userRole === 'agent') {
                propertiesQuery = supabase
                    .from('properties')
                    .select('*')
                    .eq('agent_id', userId);

                bookingsQuery = supabase
                    .from('bookings')
                    .select('*')
                    .eq('agent_id', userId)
                    .gte('created_at', this.getDateRange(period));
            } else if (userRole === 'landlord') {
                propertiesQuery = supabase
                    .from('properties')
                    .select('*')
                    .eq('landlord_id', userId);

                paymentsQuery = supabase
                    .from('payments')
                    .select('*')
                    .eq('landlord_id', userId)
                    .gte('created_at', this.getDateRange(period));
            } else if (userRole === 'tenant') {
                bookingsQuery = supabase
                    .from('bookings')
                    .select('*')
                    .eq('tenant_id', userId)
                    .gte('created_at', this.getDateRange(period));

                paymentsQuery = supabase
                    .from('payments')
                    .select('*')
                    .eq('tenant_id', userId)
                    .gte('created_at', this.getDateRange(period));
            }

            const [
                { data: properties, error: propertiesError },
                { data: bookings, error: bookingsError },
                { data: payments, error: paymentsError }
            ] = await Promise.all([
                propertiesQuery || { data: null, error: null },
                bookingsQuery || { data: null, error: null },
                paymentsQuery || { data: null, error: null }
            ]);

            if (propertiesError || bookingsError || paymentsError) {
                throw propertiesError || bookingsError || paymentsError;
            }

            return {
                properties: properties?.length || 0,
                bookings: bookings?.length || 0,
                payments: payments?.length || 0,
                revenue: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
                bookings_data: this.groupByDate(bookings, 'created_at'),
                payments_data: this.groupByDate(payments, 'created_at')
            };
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            return {
                properties: 0,
                bookings: 0,
                payments: 0,
                revenue: 0,
                bookings_data: [],
                payments_data: []
            };
        }
    }

    static async getAdminAnalytics(period = '30d') {
        try {
            const [
                { data: users, error: usersError },
                { data: properties, error: propertiesError },
                { data: bookings, error: bookingsError },
                { data: payments, error: paymentsError }
            ] = await Promise.all([
                supabase.from('profiles').select('role, created_at'),
                supabase.from('properties').select('*').gte('created_at', this.getDateRange(period)),
                supabase.from('bookings').select('*').gte('created_at', this.getDateRange(period)),
                supabase.from('payments').select('*').gte('created_at', this.getDateRange(period))
            ]);

            if (usersError || propertiesError || bookingsError || paymentsError) {
                throw usersError || propertiesError || bookingsError || paymentsError;
            }

            const userStats = this.groupByRole(users);
            const revenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            return {
                total_users: users?.length || 0,
                total_properties: properties?.length || 0,
                total_bookings: bookings?.length || 0,
                total_revenue: revenue,
                user_stats: userStats,
                properties_data: this.groupByDate(properties, 'created_at'),
                bookings_data: this.groupByDate(bookings, 'created_at'),
                revenue_data: this.groupByDate(payments, 'created_at', 'amount')
            };
        } catch (error) {
            console.error('Error fetching admin analytics:', error);
            return {
                total_users: 0,
                total_properties: 0,
                total_bookings: 0,
                total_revenue: 0,
                user_stats: {},
                properties_data: [],
                bookings_data: [],
                revenue_data: []
            };
        }
    }

    static getDateRange(period) {
        const now = new Date();
        switch (period) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7)).toISOString();
            case '30d':
                return new Date(now.setDate(now.getDate() - 30)).toISOString();
            case '90d':
                return new Date(now.setDate(now.getDate() - 90)).toISOString();
            case '1y':
                return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
            default:
                return new Date(now.setDate(now.getDate() - 30)).toISOString();
        }
    }

    static groupByDate(data, dateField, valueField = null) {
        if (!data) return [];
        
        const grouped = {};
        data.forEach(item => {
            const date = new Date(item[dateField]).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = 0;
            }
            grouped[date] += valueField ? item[valueField] : 1;
        });

        return Object.entries(grouped).map(([date, value]) => ({ date, value }));
    }

    static groupByRole(users) {
        if (!users) return {};
        
        return users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
    }

    static prepareChartData(analyticsData, chartType = 'line') {
        switch (chartType) {
            case 'line':
                return this.prepareLineChartData(analyticsData);
            case 'bar':
                return this.prepareBarChartData(analyticsData);
            case 'pie':
                return this.preparePieChartData(analyticsData);
            default:
                return this.prepareLineChartData(analyticsData);
        }
    }

    static prepareLineChartData(analyticsData) {
        const labels = analyticsData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const data = analyticsData.map(item => item.value);
        
        return {
            labels,
            datasets: [{
                label: 'Activity',
                data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }

    static prepareBarChartData(analyticsData) {
        const labels = Object.keys(analyticsData);
        const data = Object.values(analyticsData);
        
        return {
            labels,
            datasets: [{
                label: 'Count',
                data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                ]
            }]
        };
    }

    static preparePieChartData(analyticsData) {
        const labels = Object.keys(analyticsData);
        const data = Object.values(analyticsData);
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                ]
            }]
        };
    }
}