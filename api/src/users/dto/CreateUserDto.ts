import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {

    @IsUUID()
    @IsOptional()
    id: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    encryptedMasterKey: string;

    @IsString()
    kekSalt: string;

    @IsString()
    masterKeyNonce: string;
}