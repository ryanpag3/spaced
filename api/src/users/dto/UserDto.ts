import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsUUID,
} from 'class-validator';

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
}
