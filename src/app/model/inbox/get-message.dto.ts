import { ApiProperty } from '@nestjs/swagger';

export class GetMessageDto {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the message.',
        type: Number
    })
    id?: number;

    @ApiProperty({
        example: false,
        description: 'Has the message been opened?',
        type: Boolean
    })
    opened: boolean;

    @ApiProperty({
        example: 'Welcome',
        description: 'The message\'s subject.',
        type: String
    })
    subject: string;

    @ApiProperty({
        example: 'Welcome to pleagan! We are happy that you have...',
        description: 'The message\'s content.',
        type: String
    })
    text: string;

    @ApiProperty({
        example: 'https://pleagan.vg',
        description: 'Optional URL.',
        type: String,
        required: false
    })
    url: string;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the message entity was created.',
        type: String
    })
    createdAt: string;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the message entity has last been edited.',
        type: String
    })
    updatedAt: string;
}
