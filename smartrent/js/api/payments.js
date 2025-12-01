import { supabase } from './supabase-client.js';
import { showNotification } from '../utils/helpers.js';

export class PaymentService {
    static async initializePayment(paymentData) {
        try {
            const payment = {
                ...paymentData,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('payments')
                .insert([payment])
                .select()
                .single();

            if (error) throw error;

            // Integrate with Paystack/Flutterwave
            await this.processWithPaystack(data);
            return data;
        } catch (error) {
            console.error('Error initializing payment:', error);
            showNotification('Error processing payment', 'error');
            throw error;
        }
    }

    static async processWithPaystack(payment) {
        // Paystack integration
        const handler = PaystackPop.setup({
            key: 'pk_test_your_public_key', // Replace with your public key
            email: payment.tenant_email,
            amount: payment.amount * 100, // Convert to kobo
            currency: 'NGN',
            ref: payment.id,
            callback: function(response) {
                PaymentService.verifyPayment(response.reference, payment.id);
            },
            onClose: function() {
                showNotification('Payment window closed', 'warning');
            }
        });
        handler.openIframe();
    }

    static async verifyPayment(reference, paymentId) {
        try {
            // Verify payment with Paystack
            const response = await fetch(`/verify-payment?reference=${reference}`, {
                method: 'GET'
            });
            
            const result = await response.json();
            
            if (result.status) {
                // Payment successful
                await supabase
                    .from('payments')
                    .update({
                        status: 'completed',
                        paid_at: new Date().toISOString(),
                        receipt_url: result.receipt_url
                    })
                    .eq('id', paymentId);

                showNotification('Payment completed successfully!', 'success');
                
                // Generate receipt
                await this.generateReceipt(paymentId);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('id', paymentId);
                
            showNotification('Payment verification failed', 'error');
        }
    }

    static async generateReceipt(paymentId) {
        try {
            const { data: payment } = await supabase
                .from('payments')
                .select(`
                    *,
                    tenant:profiles!payments_tenant_id_fkey(full_name, email),
                    property:properties(title, address)
                `)
                .eq('id', paymentId)
                .single();

            if (!payment) throw new Error('Payment not found');

            // Generate receipt HTML
            const receiptHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .details { margin: 20px 0; }
                        .footer { margin-top: 30px; text-align: center; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>SmartRent Payment Receipt</h1>
                        <p>Receipt #${payment.id}</p>
                    </div>
                    <div class="details">
                        <p><strong>Tenant:</strong> ${payment.tenant.full_name}</p>
                        <p><strong>Property:</strong> ${payment.property.title}</p>
                        <p><strong>Address:</strong> ${payment.property.address}</p>
                        <p><strong>Amount:</strong> ₦${payment.amount.toLocaleString()}</p>
                        <p><strong>Date:</strong> ${new Date(payment.paid_at).toLocaleDateString()}</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for using SmartRent!</p>
                    </div>
                </body>
                </html>
            `;

            // Convert to PDF and store (this would require a server function)
            // For now, we'll store the HTML
            await supabase
                .from('payments')
                .update({ receipt_url: `data:text/html,${encodeURIComponent(receiptHTML)}` })
                .eq('id', paymentId);

        } catch (error) {
            console.error('Error generating receipt:', error);
        }
    }

    static async getTenantPayments(tenantId) {
        try {
            const { data: payments, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    property:properties(title, address),
                    landlord:profiles!payments_landlord_id_fkey(full_name)
                `)
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return payments || [];
        } catch (error) {
            console.error('Error fetching payments:', error);
            showNotification('Error loading payment history', 'error');
            return [];
        }
    }

    static async getLandlordPayments(landlordId) {
        try {
            const { data: payments, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    property:properties(title, address),
                    tenant:profiles!payments_tenant_id_fkey(full_name, email)
                `)
                .eq('landlord_id', landlordId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return payments || [];
        } catch (error) {
            console.error('Error fetching landlord payments:', error);
            showNotification('Error loading payments', 'error');
            return [];
        }
    }

    static async getPaymentStats(userId, userRole) {
        try {
            let query;
            
            if (userRole === 'tenant') {
                query = supabase
                    .from('payments')
                    .select('*')
                    .eq('tenant_id', userId);
            } else if (userRole === 'landlord') {
                query = supabase
                    .from('payments')
                    .select('*')
                    .eq('landlord_id', userId);
            } else {
                query = supabase.from('payments').select('*');
            }

            const { data: payments, error } = await query;
            if (error) throw error;

            const total = payments?.length || 0;
            const completed = payments?.filter(p => p.status === 'completed').length || 0;
            const pending = payments?.filter(p => p.status === 'pending').length || 0;
            const totalAmount = payments
                ?.filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0) || 0;

            return {
                total,
                completed,
                pending,
                totalAmount
            };
        } catch (error) {
            console.error('Error fetching payment stats:', error);
            return { total: 0, completed: 0, pending: 0, totalAmount: 0 };
        }
    }
}