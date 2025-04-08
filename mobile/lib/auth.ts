import Crypto from './crypto';
import * as SecureStore from 'expo-secure-store';
import SpacedApi from '@/api/spaced';
import { fromByteArray } from 'base64-js';

export type MasterKeyMaterial = {
    key: Uint8Array<ArrayBufferLike>,
    kek: {
        kek: Uint8Array<ArrayBufferLike>;
        salt: Uint8Array<ArrayBufferLike>;
    },
    encryptedKey: {
        encryptedMasterKey: Uint8Array<ArrayBufferLike>;
        nonce: Uint8Array<ArrayBufferLike>;
    }
}

export default class Auth {
    static readonly MASTERKEY = 'MASTER_KEY';
    static readonly AUTH_TOKEN_KEY = 'auth.token';

    static async signUp(username: string, email: string, password: string) {
        const masterKeyMaterial = await this.createMasterKeyMaterial(password);
        const result = await SpacedApi.signUp(
            username,
            email,
            password,
            // we store the unsigned array as a base64 encoded string in the database
            fromByteArray(masterKeyMaterial.encryptedKey.encryptedMasterKey),
            fromByteArray(masterKeyMaterial.kek.salt),
            fromByteArray(masterKeyMaterial.encryptedKey.nonce)
        );
        if (result.status !== 201) {
            throw new Error('An error occured rwhile signing up for Spaced.');
        }
        const body = await result.json() as { token: string };
        await this.storeAuthToken(body.token);
    }

    static async storeAuthToken(token: string) {
        return SecureStore.setItemAsync(this.AUTH_TOKEN_KEY, token);
    }

    static async getAuthToken() {
        return SecureStore.getItemAsync(this.AUTH_TOKEN_KEY);
    }    

    static async createMasterKeyMaterial(password: string): Promise<{
        key: Uint8Array<ArrayBufferLike>,
        kek: {
            kek: Uint8Array<ArrayBufferLike>;
            salt: Uint8Array<ArrayBufferLike>;
        },
        encryptedKey: {
            encryptedMasterKey: Uint8Array<ArrayBufferLike>;
            nonce: Uint8Array<ArrayBufferLike>;
        }
    }> {
        const key = await Crypto.generateEncryptionKey();
        const kek = await Crypto.generateKek(password);
        const encryptedKey = await Crypto.encryptMasterKey(key, kek.kek);
        const masterKey = { // tbd, should we base64 encode the unsigned arrays? Will any data loss occur on marshall/unmarshall?
            key,
            kek,
            encryptedKey
        }
        await SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(masterKey));
        return masterKey;
    }

    static async login(username: string, email: string, password: string) {

    }

}