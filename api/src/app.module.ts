import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { ObjectstoreService } from './objectstore/objectstore.service';

@Module({
  imports: [UsersModule, MediaModule],
  controllers: [AppController],
  providers: [AppService, ObjectstoreService],
})
export class AppModule {}
