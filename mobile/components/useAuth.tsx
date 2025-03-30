import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthUser {
    id: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthState = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        }
        catch (error) {
            console.error('Error checking auth state:', error);
            setIsAuthenticated(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            const token = data.token;
            if (!token) {
                throw new Error('No token received');
            }
            await SecureStore.setItemAsync('userToken', token);
            setIsAuthenticated(true);
            // we may want to query the user info and store it on login
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Sign up failed');
            }
            const token = data.token;
            if (!token) {
                throw new Error('No token received');
            }
            await SecureStore.setItemAsync('userToken', token);
            setIsAuthenticated(true);
        } catch (error) {
            throw error;
        }
    };


    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
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