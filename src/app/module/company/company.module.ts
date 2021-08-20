import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CompanyService } from './service/company/company.service';
import { CompanyController } from './controller/company/company.controller';

const services = [
  CompanyService,
];

@Module({
  imports: [ SharedModule ],
  controllers: [ CompanyController ],
  providers: services,
  exports: services,
})
export class CompanyModule {}
