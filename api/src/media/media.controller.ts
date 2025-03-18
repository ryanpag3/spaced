import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Base64Encode } from 'base64-stream';
import { Request } from 'express';
import { S3Service } from 'src/s3/s3.service';
import { PassThrough, Transform } from 'stream';


@Controller({
    path: 'media',
    version: 'v1beta1'
})
export class MediaController {
    private readonly s3Service: S3Service;

    constructor(s3Service: S3Service) {
        this.s3Service = s3Service;
    }

    @Post()
    async upload(@Req() request: Request) {
        const jsonStream = new PassThrough();
        const jsonPrefix = `{"key": "${request.headers['x-encryption-key']}","iv": "${request.headers['x-encryption-iv']}","algorithm": "${request.headers['x-encryption-algorithm']}","data": "`;
        const jsonSuffix = '"}';
        jsonStream.write(jsonPrefix);
        const base64Stream = new Base64Encode();
        request.pipe(base64Stream);
        base64Stream.on('end', () => {
            jsonStream.end(jsonSuffix);
        });
        base64Stream.pipe(jsonStream, { end: false });
        await this.s3Service.upload(jsonStream, 'test');
    }

    @Get()
    findAll() {
        return 'TODO: implement findAll';
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return 'TODO: implement findOne';
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMediaDto: any) {
        return 'TODO: implement update';
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return 'TODO: implement remove';
    }
}
