import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import prisma from 'src/db/prisma';
import { UserDto } from './dto/UserDto';

@Injectable()
export class UsersService {

    async create(user: UserDto) {
        const userResult = await prisma.user.create({
            data: user,
        });
        return plainToInstance(UserDto, userResult);
    }

    async getByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        return plainToInstance(UserDto, user);
    }

    async getByPk(pk: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: pk
            }
        });
        return plainToInstance(UserDto, user);
    }

    
}
