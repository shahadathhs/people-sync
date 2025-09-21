import { AppError } from '@/common/error/handle-error.app';
import { Injectable } from '@nestjs/common';
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
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'User not found');
    return user.email;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }
}
