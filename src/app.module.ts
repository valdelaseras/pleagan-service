import { Module } from '@nestjs/common';
import { PleaController } from './controller/plea/plea.controller';
import { PleaService } from './service/plea/plea.service';
import { PersistenceService } from './service/persistence/persistence.service';
import { ConfigurationService } from './service/configuration/configuration.service';
import { LoggerService } from './service/logger/logger.service';
import { ProductService } from './service/product/product.service';
import { PleaganService } from './service/pleagan/pleagan.service';

const services = [PleaService, ProductService, PleaganService, PersistenceService, ConfigurationService, LoggerService];

@Module({
  imports: [],
  controllers: [PleaController],
  providers: services,
})
export class AppModule {}
