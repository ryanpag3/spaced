import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
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

    // @Post()
    // async upload(@Req() request: Request) {
    //     const headers = this.mediaService.parseHeaders(request.headers);
    //     const res = await this.mediaService.upload(
    //         headers.key,
    //         headers.iv,
    //         headers.algorithm,
    //         request
    //     );
    //     return res;
    // }

    // @Get("/:id")
    // async download(@Req() request: Request, @Res() response: Response) {
    //     const id = request.params.id;
    //     const { data, key, iv, algorithm } = await this.mediaService.download(id);
    //     data.body.pipe(response);
    //     response.setHeader('x-encryption-key', key);
    //     response.setHeader('x-encryption-iv', iv);
    //     response.setHeader('x-encryption-algorithm', algorithm);
    //     return response;
    // }

}
