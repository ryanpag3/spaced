import Config from 'react-native-config';

export default class SpacedApi {
    static async signUp(username: string, email: string, password: string, encryptedMasterKey: Uint8Array, kekSalt: Uint8Array, masterKeyNonce: Uint8Array) {
        return fetch(`${Config.API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                encryptedMasterKey,
                kekSalt,
                masterKeyNonce
            })
        });        
    }
}