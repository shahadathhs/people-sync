import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, SharedModule, AdminModule, UserModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
