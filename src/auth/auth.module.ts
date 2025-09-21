import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [],
  providers: [JwtStrategy, Reflector],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
