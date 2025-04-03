import QuickCrypto from 'react-native-quick-crypto';
import { KeyPairKey } from 'react-native-quick-crypto/lib/typescript/src/Cipher';



export default class Crypto {

    /**
     * Generate an RSA key pair for asymmetric encryption.
     */
    static async generateKeyPair(): Promise<{
        publicKey: KeyPairKey;
        privateKey: KeyPairKey;
    }> {
        return new Promise((resolve, reject) => {
            QuickCrypto.generateKeyPair('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            }, (err, publicKey, privateKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ publicKey, privateKey });
                }
            });
        });
    };

    /**
     * Generate a symmetric key for symmetric encryption.
     * The salt value is persisted in the database with the encrypted master key.
     * @param password - Derive the KEK from the password using PBKDF2.
     * @returns 
     */
    static async generateKeyEncryptionKey(password: string) {
        const salt = QuickCrypto.randomBytes(16);
        const iterations = 100000;
        const keyLength = 32; // 256 bits
        const digest = 'sha256';

        return new Promise((resolve, reject) => {
            QuickCrypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ derivedKey, salt });
                }
            });
        });
    };

    /**
     * Generate a random key of the specified length.
     * @param length - The length of the key in bytes.
     * @returns 
     */
    static async generateKey(length: number) {
        return QuickCrypto.randomBytes(length);
    }

    /**
     * Encrypt data using a symmetric key.
     * @param key - The symmetric key for encryption.
     * @param data - The data to encrypt.
     * @returns 
     */
    static async encryptStream(key: Buffer, data: Buffer) {
        // TODO: Implement encryption logic
    }
}