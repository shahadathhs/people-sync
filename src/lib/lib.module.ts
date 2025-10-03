import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SeedModule } from './seed/seed.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [SeedModule, PrismaModule, UtilsModule],
  exports: [],
  providers: [],
})
export class LibModule {}
