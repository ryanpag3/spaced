import crypto from 'crypto';

const DEFAULT_SYMMETRIC_ALGORITHM = 'aes-256-cbc';

// TODO: this needs to be converted to using streaming due to large file sizes
const symmetricEncrypt = async (
    data: Buffer,
    key?: Buffer,
    options?: {
        algorithm?: string,
        iv?: Buffer
    }
): Promise<{
    buffer: Buffer,
    FEK: {
        key: Buffer,
        iv: Buffer
    },
    algorithm: string
}> => {
    const algorithm = options?.algorithm || DEFAULT_SYMMETRIC_ALGORITHM;
    const iv = options?.iv || crypto.randomBytes(16);
    const encryptionKey = key || crypto.randomBytes(32);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(data), cipher.final()]);
    return {
        buffer: encryptedBuffer,
        FEK: {
            key: encryptionKey,
            iv
        },
        algorithm
    }
};

const symmetricDecrypt = async (
    data: Buffer,
    key: Buffer,
    options?: {
        algorithm?: string,
        iv?: Buffer<ArrayBufferLike>,
        encoding?: BufferEncoding
    }
): Promise<string | Buffer> => {
    const algorithm = options?.algorithm || DEFAULT_SYMMETRIC_ALGORITHM;
    const iv = options?.iv || crypto.randomBytes(16);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decryptedBuffer = Buffer.concat([decipher.update(data), decipher.final()]);
    return decryptedBuffer;
}

const asymmetricEncrypt = () => {
    // TODO
}

const asymmetricDecrypt = () => {
    // TODO
}

const Crypto = {
    symmetricEncrypt,
    symmetricDecrypt
}

export default Crypto;