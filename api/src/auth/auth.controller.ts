import { BadRequestException, Body, ConflictException, Controller, Get, Logger, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
import { UserDto } from 'src/users/dto/UserDto';
import Public from './public.decorator';
import { AuthenticatedRequest } from 'src/common/types/request.type';
import { plainToInstance } from 'class-transformer';
import { KeysDto } from './dto/KeysDto';
import crypto from 'crypto';

@Controller('auth')
export class AuthController {
    private readonly authService: AuthService;
    private readonly usersService: UsersService;
    
    constructor(authService: AuthService, userService: UsersService) {
        this.authService = authService;
        this.usersService = userService;
    }

    @Post('signup')
    @Public()
    async signup(@Body() user: UserDto, @Res() res: Response) {
        
        if (!this.authService.isValidEmail(user.email)) {
            throw new BadRequestException('Invalid email format');
        }
        if (!this.authService.isValidPassword(user.password)) {
            throw new BadRequestException('Invalid password format');
        }

        user.password = await this.authService.hashPassword(user.password);

        let userResult;
        try {
            userResult = await this.usersService.create(user);
        }   catch (error) {
            Logger.error(`error while creating user`, error);
            if (error.code === '23505') {
                throw new ConflictException('User already exists with the specified email.');
            }
            throw new BadRequestException('User creation failed');
        }

        return this.authService.respondSuccess(res, userResult);
    }

    @Post('login')
    @Public()
    async login(@Body() login: { email: string, password: string }, @Res() res: Response) {
        const unauthorizedMessage = 'Invalid username or password.';
        const user = await this.usersService.getByEmail(login.email);
        if (!user) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        const isAuthorized = await this.authService.isAuthorized(login.password, user.password);
        if (!isAuthorized) {
            throw new UnauthorizedException(unauthorizedMessage);
        }

        return this.authService.respondSuccess(res, user);
    }

    @Get('keys')
    async getKeys(@Req() request: AuthenticatedRequest) {
        const payload = request.user;
        const user = await this.usersService.getByPk(payload.id);
        const keyMaterial = plainToInstance(KeysDto, user);
        return {
            data: keyMaterial
        }
    }

}
