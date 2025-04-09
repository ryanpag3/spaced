import Auth from '@/lib/auth';
import Config from 'react-native-config';

export default class SpacedApi {
    static async signUp(username: string, email: string, password: string, encryptedMasterKey: string, kekSalt: string, masterKeyNonce: string) {
        const body = {
            username,
            email,
            password,
            encryptedMasterKey,
            kekSalt,
            masterKeyNonce
        }
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

    static async getKeys() {
        const token = await Auth.getAuthToken();
        return fetch(`${Config.API_URL}/auth/keys`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
}