import { IsNumber, IsOptional, IsString } from "class-validator";

export class ListPostRequestDto {
    @IsNumber()
    @IsOptional()
    pageSize?: number;

    @IsString()
    @IsOptional()
    pageToken?: string;

    @IsString()
    feedType: 'profile'|'space'|'home';
}