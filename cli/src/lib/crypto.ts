import { generateKeyPair as generateKeyPairCallback } from 'crypto';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const generateKeyPair = promisify(generateKeyPairCallback);

const CONFIG_DIR = process.env.SPACED_CONFIG_DIR || path.resolve(os.homedir(), '.spaced');
const PRIVATE_KEY_PATH = path.resolve(`${CONFIG_DIR}/id_rsa`);
const PUBLIC_KEY_PATH = path.resolve(`${CONFIG_DIR}/id_rsa.pub`);

export async function initialize() {
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    await createSpacedConfigDir();

    await fs.promises.writeFile(PRIVATE_KEY_PATH, privateKey);
    await fs.promises.writeFile(PUBLIC_KEY_PATH, publicKey);
}

async function createSpacedConfigDir() {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
}

/**
 * Encrypt a file using a symmetric key and initialization vector.
 * @param path - The path to the file to encrypt.
 */
export async function encryptFile(path: string): Promise<{
    buffer: Buffer<ArrayBuffer>,
    FEK: {
        key: Buffer<ArrayBufferLike>,
        iv: Buffer<ArrayBufferLike>
    },
    algorithm: string
}> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const fileBuffer = await fs.promises.readFile(path);
    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    return {
        buffer: encryptedBuffer,
        FEK: {
            key,
            iv
        },
        algorithm
    };
};