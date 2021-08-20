import { Controller, Get } from '@nestjs/common';
import { ProductService } from '../../service/product/product.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product, ProductDto } from '../../../../model/product';

@ApiTags( 'product' )
@Controller('product')
export class ProductController {
    constructor( private productService: ProductService ) {}

    @ApiOperation({ summary: 'Get all registered products.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: () => ProductDto
    })
    @Get('all')
    getProducts(): Promise<Product[]> {
        return this.productService.getAllProducts();
    }

    @ApiOperation({ summary: 'Get all registered product\'s names.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: String
    })
    @Get('all/names-only')
    getProductNames(): Promise<string[]> {
        return this.productService.getKnownProducts();
    }
}
