import axios from '../lib/axios';
import { encryptFile } from '../lib/crypto';

export async function uploadMedia(path: string) {
    const { buffer, FEK, algorithm } = await encryptFile(path);

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