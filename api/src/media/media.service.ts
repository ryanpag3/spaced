import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import prisma from 'src/db/prisma';
import { PostService } from 'src/post/post.service';
import { S3Service } from 'src/s3/s3.service';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class MediaService {
  private readonly postService: PostService;
  private readonly s3Service: S3Service;

  constructor(s3Service: S3Service, postService: PostService) {
    this.s3Service = s3Service;
    this.postService = postService;
  }

  async upload(
    userId: string,
    postId: string,
    fileName: string,
    data: Readable
  ) {
    const key = `/${userId}/${postId}/${fileName}`;

    const existingMedia = await prisma.media.findUnique({
      where: {
        s3Key: key
      }
    });

    if (existingMedia) {
      throw new ConflictException("Media has already been uploaded.");
    }

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

}
