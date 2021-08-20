import { ProductDto } from '../product';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCompanyDto } from '../company';

export class CreatePleaDto {
    @ApiProperty()
    nonVeganProduct: ProductDto;

    @ApiProperty()
    company: CreateCompanyDto;

    @ApiProperty()
    description: string;
}
