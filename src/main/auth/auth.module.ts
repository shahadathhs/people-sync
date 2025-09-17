import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthFacebookService } from './services/auth-facebook.service';
import { AuthGoogleService } from './services/auth-google.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthLogoutService } from './services/auth-logout.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRegisterService } from './services/auth-register.service';
import { AuthTfaService } from './services/auth-tfa.service';
import { AuthGetProfileService } from './services/auth-get-profile.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthRegisterService,
    AuthGoogleService,
    AuthFacebookService,
    AuthLoginService,
    AuthOtpService,
    AuthPasswordService,
    AuthLogoutService,
    AuthTfaService,
    AuthGetProfileService,
  ],
})
export class AuthModule {}
