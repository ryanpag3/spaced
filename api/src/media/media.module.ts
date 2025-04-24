import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { S3Module } from 'src/s3/s3.module';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  imports: [S3Module, PostModule]
})
export class MediaModule {}
