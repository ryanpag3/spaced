import { IsArray, IsOptional, IsString } from 'class-validator';

export default class CreatePostDto {

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsString({ each: true })
    tags: string[];

}