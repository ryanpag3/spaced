import { Module } from '@nestjs/common';
import { TagsModule } from 'src/tag/tag.module';

@Module({
    imports: [TagsModule]
})
export class PostModule {}
