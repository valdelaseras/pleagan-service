import { ApiProperty } from '@nestjs/swagger';
import { GetPleaDto } from '../plea';

export class GetCompanyDto {
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

    @ApiProperty({
        example: [ { id: 3, nonVeganProduct: { name: 'Mega meatballs' }, et: 'cetera' } ],
        description: 'Pleas made to this company.',
        type: () => [ GetPleaDto ]
    })
    pleas?: GetPleaDto[];
}
