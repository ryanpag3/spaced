import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/services/AuthService';

interface AuthUser {
    id: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthState = async () => {
        try {
            const isAuthenticated = await AuthService.isAuthenticated();
            setIsAuthenticated(isAuthenticated);
        }
        catch (error) {
            console.error('Error checking auth state:', error);
            setIsAuthenticated(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await AuthService.signIn(email, password);
            setIsAuthenticated(true);
        } catch (e) {
            setIsAuthenticated(false);
            throw e;
        }
    };

    const signUp = async (username: string, email: string, password: string) => {
        try {
            await AuthService.signUp(username, email, password);
            setIsAuthenticated(true);
        } catch (e) {
            setIsAuthenticated(false);
            throw e;
        }
    };

    const signOut = async () => {
        try {
            await AuthService.signOut();
        } catch (error) {
            throw error;
        } finally {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuthState()
            .then(() => {
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error checking auth state:', error);
                setIsAuthenticated(false);
            });
    }, []);

    const value = {
        isAuthenticated,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}