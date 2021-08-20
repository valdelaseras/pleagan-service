import { ApiProperty } from '@nestjs/swagger';

export class GetPleaganDto {
    @ApiProperty({
        example: 'abcxyz',
        description: 'Unique id of the pleagan.',
        type: Number
    })
    uid: string;

    @ApiProperty({
        example: 'Jim Morrison',
        description: 'Unique id of the pleagan.',
        type: String
    })
    displayName: string;

    @ApiProperty({
        example: 'https://a-great-image.url',
        description: 'URL of the pleagan\'s avatar.',
        type: String
    })
    photoURL: string;

    @ApiProperty({
        example: 'Namibia',
        description: 'Country where the pleagan lives.',
        type: String
    })
    country: string;
}
