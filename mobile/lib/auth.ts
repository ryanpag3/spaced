import SpacedApi from '@/api/spaced';
import { fromByteArray } from 'base64-js';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import Crypto from './crypto';

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

export type GetKeysData = {
    data: EncryptedKeyMaterial
}

export type EncryptedKeyMaterial = {
    encryptedMasterKey: string;
    kekSalt: string;
    masterKeyNonce: string;
}

export default class Auth {
    static readonly MASTERKEY = 'auth.masterKey';
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

    static async clearAuthToken() {
        return SecureStore.deleteItemAsync(this.AUTH_TOKEN_KEY);
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
        const masterKey: MasterKeyMaterial = { // tbd, should we base64 encode the unsigned arrays? Will any data loss occur on marshall/unmarshall?
            key,
            kek,
            encryptedKey
        }
        await this.storeMasterKeyMaterial(masterKey);
        return masterKey;
    }

    static async storeMasterKeyMaterial(masterKey: MasterKeyMaterial) {
        return SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(masterKey));
    }

    static async getMasterKeyMaterial() {
        return SecureStore.getItemAsync(this.MASTERKEY);
    }

    static async clearMasterKeyMaterial() {
        return SecureStore.deleteItemAsync(this.MASTERKEY);
    }

    static async logout() {
        await this.clearAuthToken();
        await this.clearMasterKeyMaterial();
    }

    static async login(email: string, password: string) {
        // perform initial login
        const response = await SpacedApi.login(email, password);
        const data = await response.json();

        console.log(data);

        if (!data.token) {
            throw new Error('Token was not provided by login endpoint.');
        }        
        await this.storeAuthToken(data.token);

        // get keys from backend
        const keysResponse = await SpacedApi.getKeys();
        const encryptedKeyMaterial: GetKeysData = await keysResponse.json();

        // convert base64 strings to unsigned arrays
        const encryptedMasterKey = this.base64ToUint8Array(encryptedKeyMaterial.data.encryptedMasterKey);
        const kekSalt = this.base64ToUint8Array(encryptedKeyMaterial.data.kekSalt);
        const masterKeyNonce = this.base64ToUint8Array(encryptedKeyMaterial.data.masterKeyNonce);
        
        // re-generate key encryption key using users password
        const kek = await Crypto.generateKek(password, kekSalt);

        // decrypt master key
        const masterKey = await Crypto.decryptMasterKey(encryptedMasterKey, masterKeyNonce, kek.kek);
        const masterKeyMaterial: MasterKeyMaterial = {
            key: masterKey,
            kek,
            encryptedKey: {
                encryptedMasterKey,
                nonce: masterKeyNonce
            }
        };

        console.log(masterKeyMaterial);

        // store master key
        await this.storeMasterKeyMaterial(masterKeyMaterial);
    }

    private static base64ToUint8Array(base64: string): Uint8Array {
        return Uint8Array.from(Buffer.from(base64, 'base64'));
    }

}