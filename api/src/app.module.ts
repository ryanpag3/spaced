import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { PostController } from './post/post.controller';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';
import { S3Module } from './s3/s3.module';
import { S3Service } from './s3/s3.service';
import { TagsModule } from './tag/tag.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }), UsersModule, MediaModule, S3Module, AuthModule, PostModule, TagsModule],
  controllers: [AppController, PostController],
  providers: [AppService, S3Service, PostService],
})
export class AppModule { }
