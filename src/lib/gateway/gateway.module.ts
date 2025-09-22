import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Global()
@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
