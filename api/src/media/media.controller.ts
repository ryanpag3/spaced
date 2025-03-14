import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller({
    path: 'media',
    version: 'v1beta1'
})
export class MediaController {
    @Post()
    create(@Req() request: Request) {
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
