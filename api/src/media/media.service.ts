import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {

    async upload(body: string, key: string): Promise<any> {
        return 'TODO: implement upload';
    }

}
