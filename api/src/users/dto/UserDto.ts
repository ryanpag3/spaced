import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

@Exclude()
export class UserDto {

    @IsUUID()
    @Expose()
    id: string;

    @IsEmail()
    @Expose()
    username: string;

    @IsEmail()
    @Expose()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @Expose()
    encryptedMasterKey: string;

    @IsString()
    @Expose()
    kekSalt: string;

    @IsString()
    @Expose()
    masterKeyNonce: string;
}