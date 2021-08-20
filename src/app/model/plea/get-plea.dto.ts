import { GetCompanyDto } from '../company/get-company.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from '../product';
import { GetSupportDto } from '../support/get-support.dto';
import { GetPleaCompanyDto } from '../company/get-plea-company.dto';

export class GetPleaDto {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the plea.',
        type: Number
    })
    id: number;

    @ApiProperty({
        example: 1,
        description: 'Current status of the plea.',
        type: Number
    })
    status: number;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the plea entity was created.',
        type: String
    })
    createdAt: string;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the message entity was last updated.',
        type: String
    })
    updatedAt: string;

    @ApiProperty({
        example: { name: 'Mega meatballs' },
        description: 'The non-vegan product that the pleagan would like to see veganised.',
        type: () => ProductDto
    })
    nonVeganProduct: ProductDto;

    @ApiProperty({
        example: { name: 'Tasty balls' },
        description: 'The vegan product that the company in question developed in response to the plea.',
        type: () => ProductDto
    })
    veganProduct: ProductDto;

    @ApiProperty({
        example: { id: 1, name: 'Simple sense' },
        description: 'The company to whom the plea is directed.',
        type: () => GetPleaCompanyDto
    })
    company: GetPleaCompanyDto;

    @ApiProperty({
        example: 2,
        description: 'Unique id of the company.',
        type: Number
    })
    numberOfSupports: number;
}
