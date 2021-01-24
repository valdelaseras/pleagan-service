import { Module } from '@nestjs/common';
import { PleaController } from './controller/plea/plea.controller';
import { PleaService } from './service/plea/plea.service';
import { PersistenceService } from './service/persistence/persistence.service';
import { ConfigurationService } from './service/configuration/configuration.service';
import { LoggerService } from './service/logger/logger.service';

@Module({
  imports: [],
  controllers: [PleaController],
  providers: [PleaService, PersistenceService, ConfigurationService, LoggerService],
})
export class AppModule {}
