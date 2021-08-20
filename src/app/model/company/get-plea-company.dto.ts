import { ApiProperty } from '@nestjs/swagger';

export class GetPleaCompanyDto {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the company.',
        type: Number
    })
    id?: number;

    @ApiProperty({
        example: 'Simple sense',
        description: 'Unique name of the company.',
        type: String
    })
    name: string;
}
