import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ProductService } from './service/product/product.service';
import { ProductController } from './controller/product/product.controller';

const services = [
  ProductService,
];

@Module({
  imports: [ SharedModule ],
  controllers: [ ProductController ],
  providers: services,
  exports: services,
})
export class ProductModule {}
