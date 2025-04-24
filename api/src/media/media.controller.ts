import { BadRequestException, Controller, Get, Post, Req, Res } from '@nestjs/common';
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

    constructor(mediaService: MediaService, postService: PostService) {
        this.mediaService = mediaService;
        this.postService = postService;
    }

    @Post(":fileName")
    async upload(@Req() request: AuthenticatedRequest) {
        const { fileName } = request.params;
        const { post } = request.query;

        const postRecord = await this.postService.findById(post as string);
        if (!postRecord || postRecord.authorId !== request.user.id) { // this will need to be changed if we ever add collaborative posts
            throw new BadRequestException("This media can not be uploaded for the specified post.");
        }

        const media = await this.mediaService.upload(request.user.id, post as string, fileName, request);
        return {
            id: media.id,
            key: media.s3Key
        }
    }
}
