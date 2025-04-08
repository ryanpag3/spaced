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
        console.log(body);
        return fetch(`${Config.API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });        
    }
}