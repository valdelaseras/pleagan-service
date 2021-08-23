import { ApiProperty } from '@nestjs/swagger';
import { GetMessageDto } from '../message/get-message.dto';

export class GetInboxDto {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the inbox.',
        type: Number
    })
    id: number;

    @ApiProperty({
        example: [{ subject: 'Welcome', text: 'Welcome to pleagan', et: 'cetera' }],
        description: 'Messages in the inbox.',
        isArray: true,
        type: () => GetMessageDto
    })
    messages: GetMessageDto[];
}
