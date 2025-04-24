import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express'; 
import { TagsService } from 'src/tag/tag.service';
import CreatePostDto from './dto/CreatePostDto';
import { PostService } from './post.service';
import { AuthenticatedRequest } from 'src/common/types/request.type';

@Controller('posts')
export class PostController {
  private postService: PostService;
  private tagService: TagsService;

  constructor(postService: PostService, tagService: TagsService) {
    this.postService = postService;
    this.tagService = tagService;
  }

  @Post()
  async create(@Req() request: AuthenticatedRequest, @Body() body: CreatePostDto) {
    const tagInput = body.tags.map((t) => { return { name: t } });
    const tags = await this.tagService.upsertAll(tagInput);
    const post = await this.postService.create({
      ...body,
      author: {
        connect: { id: request.user.id }
      },
      tags: {
        connect: tags.map((t) => {
          return {
            id: t.id
          }
        })
      }
    });
    return post;
  }
}
