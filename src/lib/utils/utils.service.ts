import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

  sanitizedResponse(sto: any, data: any) {
    return plainToInstance(sto, data, { excludeExtraneousValues: true });
  }

  removeDuplicateIds(ids: string[]) {
    return Array.from(new Set(ids));
  }

  async getEmailById(id: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });

    return user.email;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { email } });

    return user;
  }
}
