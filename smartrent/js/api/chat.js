import { supabase } from './supabase-client.js';
import { showNotification } from '../utils/helpers.js';

export class ChatService {
    static async sendMessage(messageData) {
        try {
            const message = {
                ...messageData,
                created_at: new Date().toISOString(),
                is_read: false
            };

            const { data, error } = await supabase
                .from('messages')
                .insert([message])
                .select()
                .single();

            if (error) throw error;

            // Send real-time notification
            await this.notifyRecipient(messageData.receiver_id, 'New message received');
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Error sending message', 'error');
            throw error;
        }
    }

    static async getConversations(userId) {
        try {
            // Get unique conversations
            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey(full_name, avatar_url, role),
                    receiver:profiles!messages_receiver_id_fkey(full_name, avatar_url, role),
                    property:properties(title)
                `)
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by conversation
            const conversations = {};
            messages?.forEach(message => {
                const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
                const conversationId = [userId, otherUserId].sort().join('_');
                
                if (!conversations[conversationId]) {
                    conversations[conversationId] = {
                        id: conversationId,
                        other_user: message.sender_id === userId ? message.receiver : message.sender,
                        last_message: message,
                        unread_count: 0,
                        property: message.property
                    };
                }

                if (!message.is_read && message.receiver_id === userId) {
                    conversations[conversationId].unread_count++;
                }
            });

            return Object.values(conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    static async getMessages(userId, otherUserId, propertyId = null) {
        try {
            let query = supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
                `)
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);

            if (propertyId) {
                query = query.eq('property_id', propertyId);
            }

            query = query.order('created_at', { ascending: true });

            const { data: messages, error } = await query;

            if (error) throw error;

            // Mark messages as read
            await this.markAsRead(messages?.filter(m => m.receiver_id === userId && !m.is_read).map(m => m.id));

            return messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    static async markAsRead(messageIds) {
        if (!messageIds || messageIds.length === 0) return;

        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', messageIds);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    static async notifyRecipient(userId, message) {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: userId,
                        title: 'New Message',
                        message: message,
                        type: 'message',
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    static subscribeToMessages(userId, callback) {
        return supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();
    }

    static async getUnreadCount(userId) {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }
}