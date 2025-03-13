import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectstoreService {
    async upload(cipherText: string, fileName: string): Promise<string> {
        return null;
    }

    async del(fileName: string): Promise<void> {
        return null;
    }
}
