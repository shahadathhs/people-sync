import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UserEnum } from '../enum/user.enum';
import { JwtAuthGuard, RolesGuard } from './jwt.guard';
import { JWTPayload, UserRequest } from './jwt.interface';

export const ROLES_KEY = 'role';
export const Roles = (...roles: UserEnum[]) => SetMetadata(ROLES_KEY, roles);

export const GetUser = createParamDecorator(
  (key: JWTPayload['sub'], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    return key ? user?.sub : user;
  },
);

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
