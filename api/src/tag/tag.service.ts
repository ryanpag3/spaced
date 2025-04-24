import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prisma from 'src/db/prisma';

@Injectable()
export class TagsService {
    async create(data: Prisma.TagCreateInput) {
        return prisma.tag.create({
            data
        });
    }

    async upsertAll(data: Prisma.TagCreateInput[]) {
        return Promise.all(data.map((d) => this.upsert(d)));
    }

    async upsert(data: Prisma.TagCreateInput) {
        return prisma.tag.upsert({
            where: {
                name: data.name
            },
            create: data,
            update: data
        });
    }
}
