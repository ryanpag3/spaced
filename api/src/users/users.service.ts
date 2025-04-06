import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import prisma from 'src/db/prisma';
import { AuthUserDto } from './dto/AuthUserDto';
import { CreateUserDto } from './dto/CreateUserDto';

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
