import Config from 'react-native-config';

export type SignUpBody = {
    username: string;
    email: string;
    password: string;
    encryptedMasterKey: string;
    encryptedPrivateKey: string;
    kekSalt: string;
    masterKeyNonce: string;
    privateKeyNonce: string;
    publicKey: string;
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

    static async createPost(token: string, body: any) {
        return fetch(`${Config.API_URL}/posts`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }
}