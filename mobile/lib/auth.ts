import SpacedApi from '@/api/spaced';
import { fromByteArray } from 'base64-js';
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import Crypto, { KekMaterial } from './crypto';
import { KeyPair } from 'react-native-libsodium';

export type GetKeysData = {
    data: EncryptedKeyMaterial
}

export type EncryptedKeyMaterial = {
    encryptedMasterKey: string;
    encryptedPrivateKey: string;
    publicKey: string;
    kekSalt: string;
    masterKeyNonce: string;
    privateKeyNonce: string;
}

export default class Auth {
    static readonly MASTERKEY = 'auth.masterKey';
    static readonly KEYPAIR = 'auth.keypair';
    static readonly KEK = 'auth.kek';
    static readonly AUTH_TOKEN = 'auth.token';

    static async signUp(username: string, email: string, password: string) {
        const keyMaterial = await this.generateKeyMaterial(password);
        await SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(keyMaterial.masterKeyMaterial));
        await SecureStore.setItemAsync(this.KEYPAIR, JSON.stringify(keyMaterial.keyPairMaterial));
        await SecureStore.setItemAsync(this.KEK, JSON.stringify(keyMaterial.kekMaterial));

        const result = await SpacedApi.signUp(
            {
                username,
                email,
                password,
                encryptedMasterKey: fromByteArray(keyMaterial.masterKeyMaterial.encrypted),
                kekSalt: fromByteArray(keyMaterial.kekMaterial.salt),
                masterKeyNonce: fromByteArray(keyMaterial.masterKeyMaterial.nonce),
                encryptedPrivateKey: fromByteArray(keyMaterial.keyPairMaterial.encryptedPrivateKey.encryptedKey),
                privateKeyNonce: fromByteArray(keyMaterial.keyPairMaterial.encryptedPrivateKey.nonce),
                publicKey: fromByteArray(keyMaterial.keyPairMaterial.keyPair.publicKey)
            }
        );
        if (result.status !== 201) {
            throw new Error('An error occured rwhile signing up for Spaced.');
        }
        const body = await result.json() as { token: string };
        await SecureStore.setItemAsync(this.AUTH_TOKEN, body.token);
    }

    static async generateKeyMaterial(password: string) {
        const kekMaterial = Crypto.generateKek(password);
        const masterKeyMaterial = this.generateMasterKeyMaterial(kekMaterial);
        const keyPairMaterial = this.generateKeyPairMaterial(kekMaterial);
        return {
            kekMaterial,
            masterKeyMaterial,
            keyPairMaterial
        }
    }

    static generateMasterKeyMaterial(kekMaterial: KekMaterial) {
        const masterKey = Crypto.generateEncryptionKey();
        const encryptedKeyMaterial = Crypto.encryptKey(masterKey, kekMaterial.kek);
        return {
            plainText: masterKey,
            encrypted: encryptedKeyMaterial.encryptedKey,
            nonce: encryptedKeyMaterial.nonce
        }
    }

    static generateKeyPairMaterial(kekMaterial: KekMaterial) {
        const keyPair = Crypto.generateKeyPair();
        const encryptedPrivateKey = Crypto.encryptKey(keyPair.privateKey, kekMaterial.kek);
        return {
            keyPair,
            encryptedPrivateKey
        }
    }

    static async storeMasterKeyMaterial(masterKey: any) {
        return SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(masterKey));
    }

    static async getMasterKeyMaterial() {
        return SecureStore.getItemAsync(this.MASTERKEY);
    }

    static async clearMasterKeyMaterial() {
        return SecureStore.deleteItemAsync(this.MASTERKEY);
    }

    static async logout() {
        await SecureStore.deleteItemAsync(this.AUTH_TOKEN);
        await this.clearMasterKeyMaterial();
    }

    static async login(email: string, password: string) {
        // perform initial login
        const response = await SpacedApi.login(email, password);
        const data = await response.json();

        if (!data.token) {
            throw new Error('Token was not provided by login endpoint.');
        }

        await SecureStore.setItemAsync(this.AUTH_TOKEN, data.token);

        // get keys from backend
        const keysResponse = await SpacedApi.getKeys(data.token);
        const encryptedKeyMaterial: GetKeysData = await keysResponse.json();

        // convert base64 strings to unsigned arrays
        const encryptedMasterKey = this.base64ToUint8Array(encryptedKeyMaterial.data.encryptedMasterKey);
        const kekSalt = this.base64ToUint8Array(encryptedKeyMaterial.data.kekSalt);
        const masterKeyNonce = this.base64ToUint8Array(encryptedKeyMaterial.data.masterKeyNonce);
        const encryptedPrivateKey = this.base64ToUint8Array(encryptedKeyMaterial.data.encryptedPrivateKey);
        const privateKeyNonce = this.base64ToUint8Array(encryptedKeyMaterial.data.privateKeyNonce);
        const publicKey = this.base64ToUint8Array(encryptedKeyMaterial.data.publicKey);

        // re-generate key encryption key using users password
        const kekMaterial = Crypto.generateKek(password, kekSalt);

        const masterKey = Crypto.decryptKey(encryptedMasterKey, masterKeyNonce, kekMaterial.kek);
        const privateKey = Crypto.decryptKey(encryptedPrivateKey, privateKeyNonce, kekMaterial.kek);
        const keyMaterial = {
            kekMaterial,
            masterKeyMaterial: {
                plainText: masterKey,
                encrypted: encryptedMasterKey,
                nonce: masterKeyNonce
            },
            keyPairMaterial: {
                keyPair: {
                    publicKey,
                    privateKey
                },
                encryptedPrivateKey: {
                    encryptedKey: encryptedPrivateKey,
                    nonce: privateKeyNonce
                }
            }
        };
        await SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(keyMaterial.masterKeyMaterial));
        await SecureStore.setItemAsync(this.KEYPAIR, JSON.stringify(keyMaterial.keyPairMaterial));
        await SecureStore.setItemAsync(this.KEK, JSON.stringify(keyMaterial.kekMaterial));
    }

    private static base64ToUint8Array(base64: string): Uint8Array {
        return Uint8Array.from(Buffer.from(base64, 'base64'));
    }

}