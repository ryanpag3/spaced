import Sodium from 'react-native-libsodium';
import * as SecureStore from 'expo-secure-store';


export default class Crypto {

    /**
     * Generate a cryptographically secure encryption key with a specified length.
     */
    static async generateEncryptionKey(lenBytes: number = 32): Promise<Uint8Array> {
        return Sodium.randombytes_buf(lenBytes);
    }

    /**
     * Generate a Key Encryption Key (KEK) from the user's password.
     */
    static async generateKek(password: string) {
        const salt = Sodium.randombytes_buf(Sodium.crypto_pwhash_SALTBYTES);
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

    /**
     * Encrypt the master key using the KEK.
     */
    static async encryptMasterKey(masterKey: Uint8Array, kek: Uint8Array) {
        const nonce = Sodium.randombytes_buf(Sodium.crypto_secretbox_NONCEBYTES);
        const encryptedMasterKey = Sodium.crypto_secretbox_easy(masterKey, nonce, kek);
        return {
            encryptedMasterKey,
            nonce
        };
    }
}