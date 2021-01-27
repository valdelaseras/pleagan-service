import { Module } from '@nestjs/common';
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
  controllers: [PleaController, CompanyController, ProductController],
  providers: services,
})
export class AppModule {}
