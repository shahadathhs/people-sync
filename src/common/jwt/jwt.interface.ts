import { Request } from 'express';
import { UserEnum } from '../enum/user.enum';

export interface UserRequest extends Request {
  user?: JWTPayload;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserEnum;
}
