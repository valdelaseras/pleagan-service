import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { DeviceService } from './service/device/device.service';
import { PreauthMiddleware } from '../shared/middleware/preauth.middleware';
import { DeviceController } from './controller/device/device.controller';

const services = [
  DeviceService,
];

@Module({
  imports: [ SharedModule ],
  controllers: [ DeviceController ],
  providers: services,
  exports: services,
})
export class DeviceModule implements NestModule{
  configure( consumer: MiddlewareConsumer ): any {
    consumer
        .apply( PreauthMiddleware )
        .forRoutes(
            { path: '/device', method: RequestMethod.ALL },
        );
  }
}
