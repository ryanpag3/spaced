import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prisma from 'src/db/prisma';

@Injectable()
export class PostService {
    async create(data: Prisma.PostCreateInput) {
        return prisma.post.create({
            data
        })
    }

    async findById(id: string) {
        return prisma.post.findUnique({
            where: {
                id
            }
        });
    }

    async update(id: string, update: Prisma.PostUpdateInput) {
        return prisma.post.update({
            where: {
                id
            },
            data: update
        });
    }

    async del(id: string) {
        return prisma.post.delete({
            where: {
                id
            }
        });
    }
}
