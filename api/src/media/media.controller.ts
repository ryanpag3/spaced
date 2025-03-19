import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { MediaService } from './media.service';


@Controller({
    path: 'media',
    version: 'v1beta1'
})
export class MediaController {
    private readonly mediaService: MediaService;

    constructor(mediaService: MediaService) {
        this.mediaService = mediaService;
    }

    @Post()
    async upload(@Req() request: Request) {
        const headers = this.mediaService.parseHeaders(request.headers);
        const res = await this.mediaService.upload(
            headers.key,
            headers.iv,
            headers.algorithm,
            request
        );
        return res;
    }

}
