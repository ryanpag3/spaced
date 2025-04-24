import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import prisma from 'src/db/prisma';
import { S3Service } from 'src/s3/s3.service';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class MediaService {
  private readonly s3Service: S3Service;

  constructor(s3Service: S3Service) {
    this.s3Service = s3Service;
  }

  async upload(
    userId: string,
    postId: string,
    fileName: string,
    data: Readable
  ) {
    const key = `/${userId}/${postId}/${fileName}`;

    // check if file has already been uploaded
    const existingMedia = await prisma.media.findUnique({
      where: {
        s3Key: key
      }
    });

    if (existingMedia) {
      throw new ConflictException("Media has already been uploaded.");
    }

    // then upload it
    const passThrough = new PassThrough();
    data.pipe(passThrough);
    await this.s3Service.upload(passThrough, key);
    const mediaRecord = await prisma.media.create({
      data: {
        postId,
        type: 'PHOTO', // need to fix
        s3Key: key
      }
    });
    return mediaRecord;
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
