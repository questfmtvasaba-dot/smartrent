// This script sets up authentication with multiple providers
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Demo user credentials
const demoUsers = [
    {
        email: 'demo@tenant.com',
        password: 'demo123',
        phone: '+2348012345678',
        user_metadata: {
            full_name: 'Demo Tenant',
            role: 'tenant'
        }
    },
    {
        email: 'demo@agent.com', 
        password: 'demo123',
        phone: '+2348022345678',
        user_metadata: {
            full_name: 'Demo Agent',
            role: 'agent'
        }
    },
    {
        email: 'demo@landlord.com',
        password: 'demo123', 
        phone: '+2348032345678',
        user_metadata: {
            full_name: 'Demo Landlord',
            role: 'landlord'
        }
    },
    {
        email: 'admin@smartrent.com',
        password: 'admin123',
        phone: '+2348042345678',
        user_metadata: {
            full_name: 'Admin User',
            role: 'admin'
        }
    }
]

// Authentication service
class AuthService {
    // Email/Password Signup
    static async signUpWithEmail(userData) {
        const { email, password, phone, full_name, role } = userData
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                phone,
                options: {
                    data: {
                        full_name,
                        role: role || 'tenant'
                    }
                }
            })
            
            if (error) throw error
            return { success: true, user: data.user }
        } catch (error) {
            console.error('Signup error:', error)
            return { success: false, error: error.message }
        }
    }

    // Email/Password Login
    static async signInWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            
            if (error) throw error
            return { success: true, user: data.user }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: error.message }
        }
    }

    // Phone Signup/Login
    static async signInWithPhone(phone, password) {
        try {
            // For phone login, we'll use magic link or OTP in production
            // For demo, we'll check against our demo users
            const demoUser = demoUsers.find(user => user.phone === phone)
            if (demoUser && demoUser.password === password) {
                return await this.signInWithEmail(demoUser.email, password)
            }
            throw new Error('Invalid phone number or password')
        } catch (error) {
            console.error('Phone login error:', error)
            return { success: false, error: error.message }
        }
    }

    // Social Login (Facebook)
    static async signInWithFacebook() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            })
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Facebook login error:', error)
            return { success: false, error: error.message }
        }
    }

    // Social Login (Google)
    static async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            })
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Google login error:', error)
            return { success: false, error: error.message }
        }
    }

    // Magic Link (Passwordless login)
    static async signInWithMagicLink(email) {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            })
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Magic link error:', error)
            return { success: false, error: error.message }
        }
    }

    // Phone OTP
    static async signInWithPhoneOTP(phone) {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                phone,
                options: {
                    shouldCreateUser: true
                }
            })
            
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Phone OTP error:', error)
            return { success: false, error: error.message }
        }
    }

    // Verify OTP
    static async verifyOTP(phone, token) {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms'
            })
            
            if (error) throw error
            return { success: true, user: data.user }
        } catch (error) {
            console.error('OTP verification error:', error)
            return { success: false, error: error.message }
        }
    }

    // Logout
    static async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Logout error:', error)
            return { success: false, error: error.message }
        }
    }

    // Get current user
    static async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            return user
        } catch (error) {
            console.error('Get user error:', error)
            return null
        }
    }

    // Check if user has specific role
    static async hasRole(role) {
        const user = await this.getCurrentUser()
        if (!user) return false
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            
        return profile?.role === role
    }

    // Update user profile
    static async updateProfile(updates) {
        try {
            const user = await this.getCurrentUser()
            if (!user) throw new Error('No user logged in')
            
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()
                
            if (error) throw error
            return { success: true, profile: data }
        } catch (error) {
            console.error('Update profile error:', error)
            return { success: false, error: error.message }
        }
    }

    // Setup demo users (run once)
    static async setupDemoUsers() {
        for (const user of demoUsers) {
            const result = await this.signUpWithEmail(user)
            if (result.success) {
                console.log(`Demo user created: ${user.email}`)
            } else {
                console.log(`Demo user exists: ${user.email}`)
            }
        }
    }
}

// Initialize auth and setup demo users on first load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we need to setup demo users
    const isFirstVisit = !localStorage.getItem('demoUsersSetup')
    
    if (isFirstVisit) {
        await AuthService.setupDemoUsers()
        localStorage.setItem('demoUsersSetup', 'true')
    }
    
    // Check for existing session
    const user = await AuthService.getCurrentUser()
    if (user) {
        updateUIForAuthenticatedUser(user)
    }
})

// Update UI based on auth state
function updateUIForAuthenticatedUser(user) {
    const authButtons = document.querySelectorAll('[data-auth-modal]')
    const userMenu = document.getElementById('user-menu')
    
    authButtons.forEach(button => {
        button.innerHTML = `<i class="fas fa-user-circle mr-2"></i>Dashboard`
        button.onclick = () => {
            window.location.href = 'dashboard.html'
        }
    })
    
    if (userMenu) {
        userMenu.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-user"></i>
                </div>
                <span class="hidden md:inline">${user.email}</span>
                <i class="fas fa-chevron-down text-sm"></i>
            </div>
        `
    }
}

// Make AuthService globally available
window.AuthService = AuthService