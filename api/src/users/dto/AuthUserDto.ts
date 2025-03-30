import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

@Exclude()
export class AuthUserDto {
    @IsEmail()
    @Expose()
    readonly email: string;

    @IsString()
    @MinLength(6)
    @Expose() // used for authentication
    readonly password: string;
}