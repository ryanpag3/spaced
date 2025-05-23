import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  async hashPassword(password: string): Promise<string> {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  }

  async isAuthorized(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async respondSuccess(res: Response, userId: string, username?: string) {
    const payload = { 
      sub: userId,
      username 
    };
    const token = this.jwtService.sign(payload);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    res.send({
      token,
    });
  }
}
