import { Module } from '@nestjs/common';
import { LoggerService } from './module/shared/service/logger/logger.service';
import { PleaModule } from './module/plea/plea.module';
import { SharedModule } from './module/shared/shared.module';
import { InboxModule } from './module/inbox/inbox.module';

const services = [
  LoggerService,
];

@Module({
  imports: [
    PleaModule,
    SharedModule,
  ],
  controllers: [],
  providers: services,
})
export class AppModule {}
