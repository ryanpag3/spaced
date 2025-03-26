import Crypto from '@spaced/crypto';
import fs from 'fs/promises';
import axios from '../lib/axios';

export async function uploadMedia(path: string) {
    const fileBuffer = await fs.readFile(path);

    const { buffer, FEK, algorithm } = await Crypto.symmetricEncrypt(fileBuffer);

    const contentLength = buffer.byteLength.toString();

    const response = await axios.post('/media', buffer, {
        headers: {
            'Content-Type': 'application/octet-stream',

            // TODO: these values should be encrypted using the space key.
            'X-Encryption-Key': FEK.key.toString('base64'),
            'X-Encryption-IV': FEK.iv.toString('base64'),
            'X-Encryption-Algorithm': algorithm,
            'Content-Length': contentLength
        }
    })

    console.log(response);
}

export async function downloadMedia(key: string, filename: string) {
    const response = await axios.get(`/media/${key}`, {
        responseType: 'stream'
    });

    console.log(response.headers);

    const encryptionKey = Buffer.from(response.headers['x-encryption-key'], 'base64');
    const iv = Buffer.from(response.headers['x-encryption-iv'], 'base64');
    const algorithm = response.headers['x-encryption-algorithm'];

    const chunks: Buffer[] = [];
    for await (const chunk of response.data) {
        chunks.push(chunk);
    }
    const data = Buffer.concat(chunks);

    const fileBuffer = await Crypto.symmetricDecrypt(data, encryptionKey, {
        iv,
        algorithm
    });

    await fs.writeFile(filename, fileBuffer);
}