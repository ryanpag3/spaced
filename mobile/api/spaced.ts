import Config from 'react-native-config';

export type SignUpBody = {
    username: string;
    email: string;
    password: string;
}

export type CreateSpaceBody = {
    name: string;
    description?: string;
}

export default class SpacedApi {
    static async signUp(body: SignUpBody) {
        return fetch(`${Config.API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });        
    }

    static async login(email: string, password: string) {
        const body = {
            email,
            password
        };
        return fetch(`${Config.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }

    static async getKeys(token: string) {
        return fetch(`${Config.API_URL}/auth/keys`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async createPost(token: string, body: FormData) {
        return fetch(`${Config.API_URL}/posts`, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async getPosts(token: string, feedType: 'profile' | 'space' | 'home', size: number = 20, nextPageToken?: string) {
        let url = `${Config.API_URL}/posts?feedType=${feedType}&size=${size}`;
        
        if (nextPageToken) {
            url += `&nextPageToken=${nextPageToken}`;
        }
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response;
        } catch (error) {
            console.error('Network error fetching posts:', error);
            throw error;
        }
    }
    
    static async createSpace(token: string, body: CreateSpaceBody) {
        return fetch(`${Config.API_URL}/spaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });
    }
    
    static async getSpaces(token: string) {
        return fetch(`${Config.API_URL}/spaces`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
}