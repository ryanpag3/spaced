import Crypto from './crypto';
import * as SecureStore from 'expo-secure-store';

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

    static async signUp(username: string, email: string, password: string) {
        const masterKeyMaterial = await this.createOrGetMasterKeyMaterial(password);
        
    }

    static async createOrGetMasterKeyMaterial(password: string): Promise<{
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
        const masterKeyString = await SecureStore.getItemAsync(this.MASTERKEY);
        let masterKey = masterKeyString ? JSON.parse(masterKeyString) : undefined;
        if (!masterKey) {
            const key = await Crypto.generateEncryptionKey();
            const kek = await Crypto.generateKek(password);
            const encryptedKey = await Crypto.encryptMasterKey(key, kek.kek);
            masterKey = { // tbd, should we base64 encode the unsigned arrays? Will any data loss occur on marshall/unmarshall?
                key,
                kek,
                encryptedKey
            }
            await SecureStore.setItemAsync(this.MASTERKEY, JSON.stringify(masterKey));
        }

        return masterKey;
    }

    static async login(username: string, email: string, password: string) {

    }

}