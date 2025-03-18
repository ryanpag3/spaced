import axios from '../lib/axios';
import fs from 'fs/promises';
import Crypto from '@spaced/crypto';

export async function uploadMedia(path: string) {
    const fileBuffer = await fs.readFile(path);

    const { buffer, FEK, algorithm, encoding } = await Crypto.symmetricEncrypt(fileBuffer);

    const contentLength = buffer.byteLength.toString();

    const response = await axios.post('/media', buffer, {
        headers: {
            'Content-Type': 'application/octet-stream',

            // TODO: these values should be encrypted using the space key.
            'X-Encryption-Key': FEK.key.toString('base64'),
            'X-Encryption-IV': FEK.iv.toString('base64'),
            'X-Encryption-Algorithm': algorithm,
            'X-Encryption-Encoding': encoding,
            'Content-Length': contentLength
        }
    })

    console.log(response);
}