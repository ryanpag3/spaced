import Sodium from 'react-native-libsodium';
import * as SecureStore from 'expo-secure-store';


export default class Crypto {

    static async generateEncryptionKey(lenBytes: number = 32): Promise<Uint8Array> {
        return Sodium.randombytes_buf(lenBytes);
    }

    static async generateKek(password: string, salt?: Uint8Array) {
        salt = salt ? salt : Sodium.randombytes_buf(Sodium.crypto_pwhash_SALTBYTES);
        const kek = Sodium.crypto_pwhash(
            32,
            password,
            salt,
            Sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            Sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            Sodium.crypto_pwhash_ALG_DEFAULT
        );
        return {
            kek,
            salt
        };
    }

    static async encryptMasterKey(masterKey: Uint8Array, kek: Uint8Array) {
        const nonce = Sodium.randombytes_buf(Sodium.crypto_secretbox_NONCEBYTES);
        const encryptedMasterKey = Sodium.crypto_secretbox_easy(masterKey, nonce, kek);
        return {
            encryptedMasterKey,
            nonce
        };
    }

    static async decryptMasterKey(encryptedMasterKey: Uint8Array, nonce: Uint8Array, kek: Uint8Array) {
        return Sodium.crypto_secretbox_open_easy(encryptedMasterKey, nonce, kek);
    }
}