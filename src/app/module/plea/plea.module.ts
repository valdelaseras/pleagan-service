import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PleaService } from './service/plea/plea.service';
import { PleaController } from './controller/plea/plea.controller';
import { PreauthMiddleware } from '../shared/middleware/preauth.middleware';
import { FirebaseUserMiddleware } from '../shared/middleware/firebase-user.middleware';
import { SharedModule } from '../shared/shared.module';
import { SupportModule } from '../support/support.module';
import { ProductModule } from '../product/product.module';
import { CompanyModule } from '../company/company.module';
import { PleaganModule } from '../pleagan/pleagan.module';
import { DeviceModule } from '../device/device.module';
import { InboxModule } from '../inbox/inbox.module';

const services = [
  PleaService,
];

@Module({
  imports: [ SupportModule, ProductModule, SharedModule, CompanyModule, PleaganModule, DeviceModule, InboxModule ],
  controllers: [ PleaController ],
  providers: services,
  exports: services,
})
export class PleaModule implements NestModule {
  configure( consumer: MiddlewareConsumer ): any {
    consumer
      .apply( PreauthMiddleware )
      .forRoutes(
      { path: '/plea/my-pleas', method: RequestMethod.GET },
        { path: '/plea/my-supported-pleas', method: RequestMethod.GET },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT }
      )
      .apply( FirebaseUserMiddleware )
      .forRoutes(
          { path: '/plea', method: RequestMethod.GET }
      );
  }
}
