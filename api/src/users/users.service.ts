import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prisma from 'src/db/prisma';
import { CreateUserDto } from './dto/CreateUserDto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/UserDto';
import { AuthUserDto } from './dto/AuthUserDto';

@Injectable()
export class UsersService {

    async create(user: CreateUserDto) {
        const userResult = await prisma.user.create({
            data: user,
        });
        return plainToInstance(AuthUserDto, userResult);
    }

    async getByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        return plainToInstance(AuthUserDto, user);
    }

    
}
