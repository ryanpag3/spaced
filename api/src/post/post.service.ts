import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import prisma from '../db/prisma';
import { ListPostDto } from './dto/ListPostResponseDto';
import { PostDto } from './dto/PostDto';

@Injectable()
export class PostService {
  async getProfilePosts(
    userId: string,
    size: number = 20,
    cursor?: string,
  ): Promise<ListPostDto> {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      take: size + 1, // fetch one extra to determine if there are more results
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor itself
      }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        media: true,
      },
    });

    // Get total count for metadata
    const totalCount = await prisma.post.count({
      where: {
        authorId: userId,
      },
    });

    // Determine if we have more results
    const hasNextPage = posts.length > size;
    if (hasNextPage) {
      posts.pop(); // Remove the extra item
    }

    // Transform to DTOs and add media IDs
    const postDtos = posts.map((post) => {
      const mediaIds = post.media.map((media) => media.id);
      const mediaUris = post.media.map((media) => media.s3Key);
      const dto = plainToInstance(PostDto, {
        ...post,
        mediaIds,
        mediaUris,
      });
      return dto;
    });

    // Build the response
    return {
      posts: postDtos,
      nextPageToken: hasNextPage ? posts[posts.length - 1]?.id : undefined,
      total: totalCount,
    };
  }
}
