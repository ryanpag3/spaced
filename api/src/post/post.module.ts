import { Module } from '@nestjs/common';
import { S3Module } from 'src/s3/s3.module';
import { SpaceModule } from 'src/space/space.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [S3Module, SpaceModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
