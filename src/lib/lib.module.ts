import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { SeedModule } from './seed/seed.module';
import { UtilsModule } from './utils/utils.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    SeedModule,
    PrismaModule,
    UtilsModule,
    QueueModule,
    FileModule,
    ChatModule,
    GatewayModule,
  ],
  exports: [],
  providers: [],
})
export class LibModule {}
