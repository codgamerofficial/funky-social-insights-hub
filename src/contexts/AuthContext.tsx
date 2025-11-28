import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                toast({
                    title: 'Sign Up Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                return { error };
            }

            if (data.user) {
                toast({
                    title: 'Success!',
                    description: 'Your account has been created. Please check your email to verify your account.',
                });
            }

            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: 'Error',
                description: authError.message || 'An unexpected error occurred',
                variant: 'destructive',
            });
            return { error: authError };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast({
                    title: 'Sign In Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                return { error };
            }

            if (data.user) {
                toast({
                    title: 'Welcome back!',
                    description: 'You have successfully signed in.',
                });
            }

            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: 'Error',
                description: authError.message || 'An unexpected error occurred',
                variant: 'destructive',
            });
            return { error: authError };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                toast({
                    title: 'Sign Out Failed',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Signed Out',
                    description: 'You have been successfully signed out.',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                toast({
                    title: 'Password Reset Failed',
                    description: error.message,
                    variant: 'destructive',
                });
                return { error };
            }

            toast({
                title: 'Check Your Email',
                description: 'We sent you a password reset link.',
            });

            return { error: null };
        } catch (error) {
            const authError = error as AuthError;
            toast({
                title: 'Error',
                description: authError.message || 'An unexpected error occurred',
                variant: 'destructive',
            });
            return { error: authError };
        }
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
