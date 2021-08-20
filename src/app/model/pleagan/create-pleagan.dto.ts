import { ApiProperty } from '@nestjs/swagger';

export class CreatePleaganDto {
    @ApiProperty({
        example: 'Singapore',
        description: 'Country where the pleagan is located.',
        type: String
    })
    country: string
}
