import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMediaDto } from './dto/CreateMediaDto';

@Controller({
    path: 'media',
    version: 'v1beta1'
})
export class MediaController {
    @Post()
    create(@Body() createMediaDto: CreateMediaDto) {
        return 'TODO: implement create';
    }

    @Get()
    findAll() {
        return 'TODO: implement findAll';
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return 'TODO: implement findOne';
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMediaDto: any) {
        return 'TODO: implement update';
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return 'TODO: implement remove';
    }
}
