import { ApiProperty } from '@nestjs/swagger';
import { GetDeviceDto } from '../device';
import { UserSettingsDto } from './user-settings.dto';

export class GetCurrentPleaganDto {
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

    @ApiProperty({
        description: 'List of the devices the pleagan has configured.',
        type: () => [ GetDeviceDto ]
    })
    devices: GetDeviceDto[];

    @ApiProperty({
        description: 'The pleagan\'s settings.',
        type: () => UserSettingsDto
    })
    settings: UserSettingsDto;
}
