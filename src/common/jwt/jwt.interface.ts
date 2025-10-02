import { UserEnum } from '@/common/enum/user.enum';
import { Request } from 'express';

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserEnum | UserEnum[];
}

export interface UserRequest extends Request {
  user?: JWTPayload;
}
