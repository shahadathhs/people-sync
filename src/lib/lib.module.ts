import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { SeedModule } from './seed/seed.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [SeedModule, PrismaModule, UtilsModule, QueueModule, GatewayModule],
  exports: [],
  providers: [],
})
export class LibModule {}
