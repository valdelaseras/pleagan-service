import { ApiProperty } from '@nestjs/swagger';
import { GetPleaganDto } from '../pleagan';

export class GetSupportDto {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the support.',
        type: Number
    })
    id: number;

    @ApiProperty({
        example: 'I really like this product.',
        description: 'A Pleagan\'s comment on why they support a plea.',
        type: String
    })
    comment: string;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the support entity was created.',
        type: String
    })
    createdAt: Date;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the support entity was last updated.',
        type: String
    })
    updatedAt: Date;

    @ApiProperty({
        example: { uid: 'abcxyz', displayName: 'Jim Morrison', et: 'cetera' },
        description: 'The pleagan that supported the plea.',
        type: () => GetPleaganDto
    })
    pleagan: GetPleaganDto;
}
