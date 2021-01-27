import { Controller, Get, Query } from '@nestjs/common';
import { Company } from '../../model/company/base';
import { ProductService } from '../../service/product/product.service';

@Controller('product')
export class ProductController {
    constructor( private productService: ProductService ) {}

    @Get('all')
    searchCompanies(@Query('namesOnly') namesOnly ): Promise<string[] | Company[]> {
        if ( namesOnly ) {
            return this.productService.getKnownProducts()
        } else
            return this.productService.getAllProducts()
    }
}
