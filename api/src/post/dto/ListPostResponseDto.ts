import { Exclude, Expose } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { PostDto } from "./PostDto";

@Exclude()
export class ListPostDto {    
    @Expose()
    @IsArray()
    posts: PostDto[]

    @Expose()
    @IsOptional()
    @IsString()
    nextPageToken?: string;

    @Expose()
    @IsNumber()
    total: number;
}