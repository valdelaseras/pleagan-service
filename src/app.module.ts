import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PleaController } from './controller/plea/plea.controller';
import { PleaService } from './service/plea/plea.service';
import { PersistenceService } from './service/persistence/persistence.service';
import { LoggerService } from './service/logger/logger.service';
import { ProductService } from './service/product/product.service';
import { PleaganService } from './service/pleagan/pleagan.service';
import { CompanyService } from './service/company/company.service';
import { CompanyController } from './controller/company/company.controller';
import { ProductController } from './controller/product/product.controller';
import { PleaganController } from './controller/pleagan/pleagan.controller';
import { PreauthMiddleware } from './auth/preauth.middleware';
import { FirebaseService } from './service/firebase/firebase.service';
import { SupportService } from './service/support/support.service';
import { SupportController } from './controller/support/support.controller';
import configuration from './configuration';
import { FirebaseUserMiddleware } from './auth/firebase-user.middleware';

const services = [
  PleaService,
  ProductService,
  CompanyService,
  PleaganService,
  PersistenceService,
  LoggerService,
  FirebaseService,
  SupportService
];

@Module({
  imports: [ ConfigModule.forRoot({
    load: [ configuration ]
  }) ],
  controllers: [PleaController, CompanyController, ProductController, PleaganController, SupportController],
  providers: services,
})
export class AppModule implements NestModule {
  configure( consumer: MiddlewareConsumer ): any {
    consumer
        .apply( PreauthMiddleware )
        .forRoutes(
        { path: '/plea/my-pleas', method: RequestMethod.GET },
        { path: '/plea/my-supported-pleas', method: RequestMethod.GET },
        { path: '/pleagan/', method: RequestMethod.ALL },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT }
        )
        .apply( FirebaseUserMiddleware )
        .forRoutes(
            { path: '/plea/all', method: RequestMethod.GET }
        );
  }
}
