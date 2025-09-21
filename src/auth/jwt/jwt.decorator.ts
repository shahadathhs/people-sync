import { UserEnum } from '@/common/enum/user.enum';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from './jwt.constants';
import { JwtAuthGuard, RolesGuard } from './jwt.guard';
import { JWTPayload, UserRequest } from './jwt.interface';

// Roles metadata
export const Roles = (...roles: UserEnum[]) => SetMetadata('roles', roles);

// Public decorator to skip auth guards
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// GetUser decorator
export const GetUser = createParamDecorator(
  (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    const user = request.user as JWTPayload | undefined;
    if (!user) return undefined;
    if (!data) return user;
    return user[data];
  },
);

// Composite decorator - apply guards and optional role metadata
export function ValidateAuth(...roles: UserEnum[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

export function ValidateOwner() {
  return ValidateAuth(UserEnum.OWNER);
}

export function ValidateSuperAdmin() {
  return ValidateAuth(UserEnum.SUPER_ADMIN, UserEnum.OWNER);
}

export function ValidateAdmin() {
  return ValidateAuth(UserEnum.ADMIN, UserEnum.SUPER_ADMIN, UserEnum.OWNER);
}
