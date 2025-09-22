import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    FileModule,
    ChatModule,
    SharedModule,
    AdminModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
