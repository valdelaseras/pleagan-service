import { ApiProperty } from '@nestjs/swagger';
import { GetProductDto } from '../product';
import { GetPleaCompanyDto } from '../company';
import { GetPleaganDto } from '../pleagan';

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
        example: 'I would love a vegan version of ... ',
        description: 'The description',
        type: String
    })
    description: string;

    @ApiProperty({
        example: { name: 'Mega meatballs' },
        description: 'The non-vegan product that the pleagan would like to see veganised.',
        type: () => GetProductDto
    })
    nonVeganProduct: GetProductDto;

    @ApiProperty({
        example: { name: 'Tasty balls' },
        description: 'The vegan product that the company in question developed in response to the plea.',
        type: () => GetProductDto
    })
    veganProduct: GetProductDto;

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

    @ApiProperty({
        example: 'abc',
        description: 'Unique identifier of the pleagan that initiated this plea.',
        type: String,
    })
    pleaganUid: string;

    @ApiProperty({
        example: true,
        description: 'Whether or not the currently logged in pleagan has already supported this plea.',
        type: Boolean
    })
    userHasSupported: boolean;
}
