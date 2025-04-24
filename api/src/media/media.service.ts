import { HttpException, Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import prisma from 'src/db/prisma';
import { S3Service } from 'src/s3/s3.service';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class MediaService {
    private readonly s3Service: S3Service;
    private readonly X_ENCRYPTION_KEY = 'x-encryption-key';
    private readonly X_ENCRYPTION_IV = 'x-encryption-iv';
    private readonly X_ENCRYPTION_ALGORITHM = 'x-encryption-algorithm';

    constructor(s3Service: S3Service) {
        this.s3Service = s3Service;
    }

    async upload(
        key: string,
        iv: string,
        algorithm: string,
        data: Readable
    ) {
        // // store metadata
        // const response = await prisma.media.create({
        //     data: {
        //         encryptionKey: key,
        //         iv,
        //         algorithm
        //     }
        // });
        
        // // store data
        // const passthru = new PassThrough();
        // data.pipe(passthru);
        // await this.s3Service.upload(passthru, response.id);
        // return {
        //     id: response.id
        // }
    }

    parseHeaders(headers: IncomingHttpHeaders) {
        const key = this.assertDefined(headers[this.X_ENCRYPTION_KEY] as string, this.X_ENCRYPTION_KEY);
        const iv = this.assertDefined(headers[this.X_ENCRYPTION_IV] as string, this.X_ENCRYPTION_IV);
        const algorithm = this.assertDefined(headers[this.X_ENCRYPTION_ALGORITHM] as string, this.X_ENCRYPTION_ALGORITHM);

        return {
            key,
            iv,
            algorithm
        }
    }

    assertDefined(value: string, name: string) {
        if (!value) {
            throw new HttpException(`Missing required header: ${name}`, 400);
        }
        return value;
    }

    async download(id: string) {
        // const media = await prisma.media.findUnique({
        //     where: {
        //         id
        //     }
        // });

        // if (!media) {
        //     throw new HttpException('Media not found', 404);
        // }

        // const data = await this.s3Service.download(id);
        // return {
        //     data,
        //     key: media.encryptionKey,
        //     iv: media.iv,
        //     algorithm: media.algorithm
        // }
    }

}
