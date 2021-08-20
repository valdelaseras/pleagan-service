import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SupportService } from './service/support/support.service';
import { SupportController } from './controller/support/support.controller';

const services = [
  SupportService,
];

@Module({
  imports: [ SharedModule ],
  controllers: [ SupportController ],
  providers: services,
  exports: services,
})
export class SupportModule {}
