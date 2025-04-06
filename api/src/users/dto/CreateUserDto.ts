import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    encryptedMasterKey: string;

    @IsString()
    encryptedPrivateKey: string;

    @IsString()
    publicKey: string;

    @IsString()
    kekSalt: string;
    
}