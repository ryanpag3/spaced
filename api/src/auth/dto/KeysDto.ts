import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class KeysDto {

    @IsString()
    @Expose()
    readonly encryptedMasterKey: string;

    @IsString()
    @Expose()
    readonly kekSalt: string;

    @IsString()
    @Expose()
    readonly masterKeyNonce: string;

    @IsString()
    @Expose()
    readonly privateKeyNonce: string;

    @IsString()
    @Expose()
    readonly encryptedPrivateKey: string;

    @IsString()
    @Expose()
    readonly publicKey: string;
    
}