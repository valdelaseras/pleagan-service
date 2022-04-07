import { CreateProductDto } from '../product';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCompanyDto } from '../company';

export class CreatePleaDto {
    @ApiProperty({
        example: { name: 'Mega Meatballs', imageUrl: 'https://abc.xyz' },
        description: 'The non-vegan product that the pleagan would like to see veganised.',
        type: () => CreateProductDto
    })
    nonVeganProduct: CreateProductDto;

    @ApiProperty({
        example: { name: 'Simple sense' },
        description: 'Pleas made to this company.',
        type: () => CreateCompanyDto
    })
    company: CreateCompanyDto;

    @ApiProperty()
    description: string;

    constructor ( nonVeganProduct: CreateProductDto, company: CreateCompanyDto, description: string ) {
        this.nonVeganProduct = nonVeganProduct;
        this.company = company;
        this.description = description;
    }
}
