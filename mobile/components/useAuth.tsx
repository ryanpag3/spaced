import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/services/AuthService';

interface AuthUser {
    id: string;
    username?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    user: AuthUser | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<AuthUser | null>(null);

    const checkAuthState = async () => {
        try {
            const isAuthenticated = await AuthService.isAuthenticated();
            setIsAuthenticated(isAuthenticated);
            
            if (isAuthenticated) {
                const userInfo = await AuthService.getUserInfo();
                setUser(userInfo);
            } else {
                setUser(null);
            }
        }
        catch (error) {
            console.error('Error checking auth state:', error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await AuthService.signIn(email, password);
            setIsAuthenticated(true);
            const userInfo = await AuthService.getUserInfo();
            setUser(userInfo);
        } catch (e) {
            setIsAuthenticated(false);
            setUser(null);
            throw e;
        }
    };

    const signUp = async (username: string, email: string, password: string) => {
        try {
            await AuthService.signUp(username, email, password);
            setIsAuthenticated(true);
            const userInfo = await AuthService.getUserInfo();
            setUser(userInfo);
        } catch (e) {
            setIsAuthenticated(false);
            setUser(null);
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
            setUser(null);
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
                setUser(null);
            });
    }, []);

    const value = {
        isAuthenticated,
        loading,
        user,
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