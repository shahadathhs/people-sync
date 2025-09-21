import { UserRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  employeeId: number;

  @Expose()
  role: UserRole;

  @Expose()
  name?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  isLoggedIn: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  lastLogoutAt?: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  isBanned: boolean;

  @Expose()
  isUsernameUpdated: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
