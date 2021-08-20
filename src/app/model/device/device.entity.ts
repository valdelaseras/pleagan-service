import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Pleagan } from '../pleagan';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique(['uuid', 'token'])
export class Device {
    @ApiProperty({
        example: 'abcxyz',
        description: 'Unique identifier for device. This is generated in the app and is able to target single browsers.'
    })
    @PrimaryColumn()
    uuid: string;

    @ApiProperty({
        example: 'abcxyz',
        description: 'Firebase Cloud Messaging token that is acquired from Firebase upon user consent.'
    })
    @Column()
    token: string;

    @ApiProperty({
        example: { uid: 'abcxyz', displayName: 'Jim Morrison', et: 'cetera' },
        description: 'The pleagan that owns this device.',
        type: () => Pleagan
    })
    @ManyToOne((type) =>  Pleagan, (pleagan) => pleagan.devices, {
        eager: false
    })
    pleagan: Pleagan;

    @ApiProperty({
        example: true,
        description: 'Should this device receive a push notification when their plea\'s status changes?',
        type: Boolean
    })
    @Column({
        default: false,
    })
    notifyOnMyPleas: boolean;

    @ApiProperty({
        example: false,
        description: 'Should this device receive a push notification when the status of a plea that they support changes?',
        type: Boolean
    })
    @Column({
        default: false,
    })
    notifyOnSupportedPleas: boolean;

    @ApiProperty({
        example: false,
        description: 'Should this device receive a push notification when interesting news is published?',
        type: Boolean
    })
    @Column({
        default: false,
    })
    notifyOnNews: boolean;

    constructor(
        uuid: string,
        token: string,
        pleagan: Pleagan,
        notifyOnMyPleas: boolean,
        notifyOnSupportedPleas: boolean,
        notifyOnNews: boolean
    ) {
        this.uuid = uuid;
        this.token = token;
        this.pleagan = pleagan;
        this.notifyOnMyPleas = notifyOnMyPleas;
        this.notifyOnSupportedPleas = notifyOnSupportedPleas;
        this.notifyOnNews = notifyOnNews;
    }
}
