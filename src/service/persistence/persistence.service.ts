import { createConnection, ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { Evt } from 'evt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfiguration } from '../../model/configuration/base';

@Injectable()
export class PersistenceService {
  connectionReadyEvent = Evt.create<void>();
  constructor( private configService: ConfigService ) {
    this.connectToStorage();
  }

  private async connectToStorage(): Promise<void> {
    const connectionOptions = Object.assign(
      {
        entities: [path.join(__dirname, '../../model/**/*.entity.js')],
        synchronize: true,
        logging: !!this.configService.get<boolean>('databaseLogging'),
      },
      this.configService.get<DatabaseConfiguration>('database'),
    ) as ConnectionOptions;

    await createConnection(connectionOptions);
    this.connectionReadyEvent.post();
  }
}
