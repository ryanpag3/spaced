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

    @Post("/:postId/:fileName")
    async upload(@Req() request: AuthenticatedRequest) {
        const { postId, fileName } = request.params;
        const key = `/${request.user.id}/${postId}/${fileName}`;
        await this.mediaService.upload(key, request);
        


        // upload the media
        // update the post with the reference to media
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
