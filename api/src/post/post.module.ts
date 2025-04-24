import { Module } from '@nestjs/common';
import { TagsModule } from 'src/tag/tag.module';
import { PostService } from './post.service';

@Module({
    providers: [PostService],
    imports: [TagsModule],
    exports: [PostService]
})
export class PostModule {}
