import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { PleaganService } from './service/pleagan/pleagan.service';
import { PleaganController } from './controller/pleagan/pleagan.controller';
import { DeviceModule } from '../device/device.module';
import { PreauthMiddleware } from '../shared/middleware/preauth.middleware';
import { InboxModule } from '../inbox/inbox.module';

const services = [
  PleaganService,
];

@Module({
  imports: [ DeviceModule, SharedModule, InboxModule ],
  controllers: [ PleaganController ],
  providers: services,
  exports: services,
})
export class PleaganModule implements NestModule {
  configure( consumer: MiddlewareConsumer ): any {
    consumer
      .apply( PreauthMiddleware )
      .forRoutes(
          { path: '/pleagan/', method: RequestMethod.ALL },
      );
  }
}
