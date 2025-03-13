import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {

    async create(data: any) {
        return data;
    }

    async findAll() {
        return [];
    }

    async findOne(id: string) {
        return { id };
    }

    async update(id: string, data: any) {
        return { id, ...data };
    }

    async remove(id: string) {
        return { id };
    }

}
