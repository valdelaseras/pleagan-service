import { ApiProperty } from '@nestjs/swagger';

export class GetDeviceDto {
    @ApiProperty({
        example: 'abcxyz',
        description: 'Unique identifier for device. This is generated in the app and is able to target single browsers.'
    })
    uuid: string;

    @ApiProperty({
        example: 'abcxyz',
        description: 'Firebase Cloud Messaging token that is acquired from Firebase upon user consent.'
    })
    token: string;

    @ApiProperty({
        example: true,
        description: 'Should this device receive a push notification when their plea\'s status changes?',
        type: Boolean
    })
    notifyOnMyPleas: boolean;

    @ApiProperty({
        example: false,
        description: 'Should this device receive a push notification when the status of a plea that they support changes?',
        type: Boolean
    })
    notifyOnSupportedPleas: boolean;

    @ApiProperty({
        example: false,
        description: 'Should this device receive a push notification when interesting news is published?',
        type: Boolean
    })
    notifyOnNews: boolean;
}
