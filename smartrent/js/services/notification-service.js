import { supabase } from '../api/supabase-client.js';
import { showNotification as showUINotification } from '../utils/helpers.js';

export class NotificationService {
    static async getNotifications(userId, limit = 20) {
        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return notifications || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    static async markAsRead(notificationId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    static async markAllAsRead(userId) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    static async getUnreadCount(userId) {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    static async createNotification(notificationData) {
        try {
            const notification = {
                ...notificationData,
                created_at: new Date().toISOString(),
                is_read: false
            };

            const { data, error } = await supabase
                .from('notifications')
                .insert([notification])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static subscribeToNotifications(userId, callback) {
        return supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    callback(payload.new);
                    this.showBrowserNotification(payload.new);
                }
            )
            .subscribe();
    }

    static showBrowserNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/assets/icons/icon-192x192.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/assets/icons/icon-192x192.png'
                    });
                }
            });
        }
    }

    static async requestNotificationPermission() {
        if (!('Notification' in window)) {
            showUINotification('Browser does not support notifications', 'warning');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Specific notification types
    static async notifyBookingConfirmation(bookingId, userId) {
        return this.createNotification({
            user_id: userId,
            title: 'Booking Confirmed',
            message: 'Your property inspection has been confirmed',
            type: 'booking',
            related_entity_type: 'booking',
            related_entity_id: bookingId
        });
    }

    static async notifyNewMessage(userId, senderName) {
        return this.createNotification({
            user_id: userId,
            title: 'New Message',
            message: `You have a new message from ${senderName}`,
            type: 'message'
        });
    }

    static async notifyPaymentReceived(userId, amount) {
        return this.createNotification({
            user_id: userId,
            title: 'Payment Received',
            message: `Payment of ₦${amount} has been received`,
            type: 'payment'
        });
    }

    static async notifyPropertyVerification(propertyId, userId, approved = true) {
        return this.createNotification({
            user_id: userId,
            title: approved ? 'Property Verified' : 'Property Rejected',
            message: approved ? 
                'Your property listing has been verified and is now live' :
                'Your property listing needs additional verification',
            type: 'property',
            related_entity_type: 'property',
            related_entity_id: propertyId
        });
    }
}