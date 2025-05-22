import { Exclude, Expose } from 'class-transformer';
import { IsArray, IsString, IsUUID } from 'class-validator';

@Exclude()
export class PostDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  description?: string;

  @Expose()
  @IsUUID()
  authorId: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  mediaUris: string[];
}
