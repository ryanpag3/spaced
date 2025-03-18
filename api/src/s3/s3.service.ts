import { CreateBucketCommand, DeleteObjectCommand, DeleteObjectCommandOutput, HeadBucketCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';

@Injectable()
export class S3Service {
    private readonly client: S3Client;

    constructor() {
        this.client = new S3Client({ 
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
            },
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            region: process.env.S3_REGION 
        });
        this.ensureBucketExists();
    }

    async ensureBucketExists(): Promise<void> {
        try {
            await this.client.send(new HeadBucketCommand({
                Bucket: process.env.S3_BUCKET_NAME,
            }));
        } catch (error) {
            if (error.name === 'NotFound') {
                await this.client.send(new CreateBucketCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                }));
            } else {
                // noop
            }
        }
    }

    /**
     * Upload a file to S3.
     * @param body - The file to upload.
     * @param key - The key to store the file under.
     */
    async upload(body: PassThrough, key: string): Promise<PutObjectCommandOutput> {
        const parallelUpload = new Upload({
            client: this.client,
            params: {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                Body: body,
            },
            queueSize: 4,
            partSize: 5 * 1024 * 1024, // 5 MB
            leavePartsOnError: false,
        });

        parallelUpload.on('httpUploadProgress', (progress) => {
            console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
        });

        const result = await parallelUpload.done();
        return result;
    }


    /**
     * Delete a file from S3.
     * @param key - The key of the file to delete.
     */
    async del(key: string): Promise<DeleteObjectCommandOutput> {
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
        });
        return this.client.send(command);
    }
}
