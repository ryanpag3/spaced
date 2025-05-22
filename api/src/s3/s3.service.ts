import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      region: process.env.S3_REGION,
    });
    this.ensureBucketExists();
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: process.env.S3_BUCKET_NAME,
        }),
      );
    } catch (error) {
      if (error.name === 'NotFound') {
        try {
          await this.client.send(
            new CreateBucketCommand({
              Bucket: process.env.S3_BUCKET_NAME,
            }),
          );
        } catch (e) {
          Logger.debug(
            'An error was thrown while trying to create bucket. This is probably benign, but logging here for posterity.',
            e,
          );
        }
      } else {
        // noop
      }
    }
  }

  /**
   * Upload a file to the specified key.
   * @param key - The unique key where the file is stored in the S3 bucket.
   * @param file - The file to upload.
   * @returns
   */
  public async uploadFile(
    key: string,
    file: Express.Multer.File,
  ): Promise<{
    key: string;
    originalname: string;
    mimetype: string;
  }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    Logger.debug(`Uploaded ${file.originalname} to S3 under key ${key}`);
    return {
      key,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
  }

  public async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
    );
    Logger.debug(`Deleted file from S3 with key ${key}`);
  }

  /**
   * Get a file from S3 using its key
   * @param key - The unique key where the file is stored in the S3 bucket
   * @returns The S3 GetObjectCommandOutput
   */
  public async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    return await this.client.send(command);
  }
}
