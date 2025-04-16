import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

@Exclude()
export class UserDto {

    @IsUUID()
    @IsOptional()
    @Expose()
    id: string;

    @IsString()
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
    encryptedPrivateKey: string;

    @IsString()
    @Expose()
    publicKey: string;

    @IsString()
    @Expose()
    encryptedMasterKey: string;

    @IsString()
    @Expose()
    kekSalt: string;

    @IsString()
    @Expose()
    masterKeyNonce: string;

    @IsString()
    @Expose()
    privateKeyNonce: string;
}