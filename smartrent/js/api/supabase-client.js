import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://jdmpinheodbxsdeshsry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkbXBpbmhlb2RieHNkZXNoc3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODkwMjgsImV4cCI6MjA4MDA2NTAyOH0.8yUGqKJ-SJkupEETO5PshndtcZZibwmHGbVn6QZwi7w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function initializeApp() {
    console.log('Initializing SmartRent App...');
    
    try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
        } else if (session) {
            console.log('User session found:', session.user.email);
            await createUserProfile(session.user);
            updateUIForAuthenticatedUser(session.user);
        } else {
            console.log('No user session found');
            updateUIForLoggedOutUser();
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            if (event === 'SIGNED_IN' && session) {
                await createUserProfile(session.user);
                updateUIForAuthenticatedUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                updateUIForLoggedOutUser();
            }
        });

        return true;
    } catch (error) {
        console.error('Error initializing app:', error);
        return false;
    }
}

async function createUserProfile(user) {
    try {
        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking profile:', fetchError);
            return;
        }

        if (!existingProfile) {
            // Create new profile
            const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        role: user.user_metadata?.role || 'tenant',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error('Error creating user profile:', insertError);
            } else {
                console.log('User profile created successfully');
            }
        }
    } catch (error) {
        console.error('Error in createUserProfile:', error);
    }
}

function updateUIForAuthenticatedUser(user) {
    console.log('Updating UI for authenticated user:', user.email);
    const authButtons = document.querySelectorAll('[data-auth-modal]');
    
    authButtons.forEach(button => {
        button.innerHTML = `<i class="fas fa-user-circle mr-2"></i>Dashboard`;
        button.onclick = () => {
            window.location.href = 'dashboard.html';
        };
    });
}

function updateUIForLoggedOutUser() {
    console.log('Updating UI for logged out user');
    const authButtons = document.querySelectorAll('[data-auth-modal]');
    
    authButtons.forEach(button => {
        button.innerHTML = `<i class="fas fa-user mr-2"></i>Login`;
        button.onclick = () => {
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.classList.remove('hidden');
        };
    });
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getCurrentUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
    return profile;
}