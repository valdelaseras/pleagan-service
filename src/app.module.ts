import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PleaController } from './controller/plea/plea.controller';
import { PleaService } from './service/plea/plea.service';
import { PersistenceService } from './service/persistence/persistence.service';
import { ConfigurationService } from './service/configuration/configuration.service';
import { LoggerService } from './service/logger/logger.service';
import { ProductService } from './service/product/product.service';
import { PleaganService } from './service/pleagan/pleagan.service';
import { CompanyService } from './service/company/company.service';
import { CompanyController } from './controller/company/company.controller';
import { ProductController } from './controller/product/product.controller';
import { PleaganController } from './controller/pleagan/pleagan.controller';
import { PreauthMiddleware } from './auth/preauth.middleware';

const services = [
  PleaService,
  ProductService,
  CompanyService,
  PleaganService,
  PersistenceService,
  ConfigurationService,
  LoggerService,
];

@Module({
  imports: [],
  controllers: [PleaController, CompanyController, ProductController, PleaganController],
  providers: services,
})
export class AppModule implements NestModule {
  configure( consumer: MiddlewareConsumer ): any {
    consumer
        .apply( PreauthMiddleware )
        .forRoutes(
        { path: '/pleagan/', method: RequestMethod.ALL },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT }
        );
  }
}
