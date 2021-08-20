import { Injectable } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { Device } from '../../../../model/device';

@Injectable()
export class DeviceService {
    private namespace = 'device-service';
    private deviceRepository: Repository<Device>;

    constructor(
        private persistenceService: PersistenceService,
    ) {
        this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
    }

    async addDevice( pleaganUid: string, token: string, uuid: string ): Promise<void> {
        const existingDevice = await this.getDeviceByUuid( uuid );

        if ( !existingDevice ) {
            // Create a new device
            await this.deviceRepository.createQueryBuilder()
                .insert()
                .into( Device )
                .values({
                    uuid,
                    token,
                })
                .execute();

            // Connect this device to the pleagan in question
            await this.deviceRepository.createQueryBuilder()
                .relation( Device, 'pleagan' )
                .add( pleaganUid );
        } else {
            await this.deviceRepository.createQueryBuilder()
                .update( Device )
                .set( { token } )
                .where( 'id = :id', { id: existingDevice.uuid } )
                .execute();
        }
    }

    async updateDevice( device: Device ): Promise<void> {
        await this.deviceRepository.createQueryBuilder( 'device' )
            .update( Device )
            .set( device )
            .where( 'device.uuid = :uuid', { uuid: device.uuid } )
            .execute()
    }

    async deleteDevice( uuid: string ): Promise<void> {
        await this.deviceRepository.createQueryBuilder( 'device' )
            .delete()
            .from( Device )
            .where( 'device.uuid = :uuid', { uuid } )
            .execute();
    }

    async getSupporterDevicesByPlea( id: number ): Promise<Device[]> {
        return this.deviceRepository.createQueryBuilder( 'device' )
            .innerJoin( 'device.pleagan', 'pleagan' )
            .innerJoin( 'pleagan.supports', 'support' )
            .innerJoin( 'support.plea', 'plea' )
            .where( 'plea.id = :id', { id } )
            .getMany();
    }

    async getDeviceByUuid( uuid: string ): Promise<Device> {
        return this.deviceRepository.createQueryBuilder( 'device' )
            .where( 'device.uuid = :uuid', { uuid } )
            .getOne();
    }

    async getDevicesByPleagan( uid: string ): Promise<Device[]> {
        return this.deviceRepository.createQueryBuilder( 'device' )
            .leftJoin( 'device.pleagan', 'pleagan' )
            .where( 'pleagan.uid = :uid', { uid } )
            .getMany();
    }

    // async updateDeviceSettings( uuid: string, settings: INotificationSettings ): Promise<void> {
    //     const device = await this.getDeviceByUuid( uuid );
    //
    //     for ( const key in Object.keys( device.settings ) ) {
    //         if ( settings[ key ] !== device.settings[ 'key' ] ) {
    //             if ( settings[ key ] ) {
    //                 // this setting was turned on
    //                 // subscribe device to topics
    //             } else {
    //                 // this setting was turned off
    //                 // unsubscribe device from topics
    //             }
    //         }
    //     }
    // }

    private initialiseRepository = (): void => {
        this.deviceRepository = getRepository( Device );
    };
}
