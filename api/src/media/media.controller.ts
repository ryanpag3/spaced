import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { MediaService } from './media.service';
import { AuthenticatedRequest } from 'src/common/types/request.type';
import { PostService } from 'src/post/post.service';


@Controller({
    path: 'media',
    version: 'v1beta1'
})
export class MediaController {
    private readonly mediaService: MediaService;
    private readonly postService: PostService;

    constructor(mediaService: MediaService) {
        this.mediaService = mediaService;
    }

    @Post(":fileName")
    async upload(@Req() request: AuthenticatedRequest) {
        const { fileName } = request.params;
        const { post } = request.query;

        const media = await this.mediaService.upload(request.user.id, post as string, fileName, request);

        return {
            id: media.id,
            key: media.s3Key
        }
    }

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
