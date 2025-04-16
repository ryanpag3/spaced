import Sodium from 'react-native-libsodium';

export type KekMaterial = {
    kek: Uint8Array<ArrayBufferLike>,
    salt: Uint8Array<ArrayBufferLike>
};

export type KeyMaterial = {
    encryptedKey: Uint8Array<ArrayBufferLike>,
    nonce: Uint8Array<ArrayBufferLike>
};

export default class Crypto {

    static generateEncryptionKey(lenBytes: number = 32): Uint8Array {
        return Sodium.randombytes_buf(lenBytes);
    }

    static generateKek(password: string, salt?: Uint8Array): KekMaterial {
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

    static generateKeyPair(): Sodium.KeyPair {
        return Sodium.crypto_box_keypair();
    }

    static encryptKey(key: Uint8Array, kek: Uint8Array): KeyMaterial {
        const nonce = Sodium.randombytes_buf(Sodium.crypto_secretbox_NONCEBYTES);
        const encryptedKey = Sodium.crypto_secretbox_easy(key, nonce, kek);
        return {
            encryptedKey,
            nonce
        };
    }

    static decryptKey(encryptedMasterKey: Uint8Array, nonce: Uint8Array, kek: Uint8Array) {
        return Sodium.crypto_secretbox_open_easy(encryptedMasterKey, nonce, kek);
    }
}