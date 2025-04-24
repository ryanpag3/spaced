import { Module } from '@nestjs/common';
import { TagsService } from './tag.service';

@Module({
  providers: [TagsService],
  exports: [TagsService]
})
export class TagsModule {

}
