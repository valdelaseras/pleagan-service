import { createConnection, ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { ConfigurationService } from '../configuration/configuration.service';
import { Evt } from 'evt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PersistenceService {
  connectionReadyEvent = Evt.create<void>();
  constructor(private configurationService: ConfigurationService) {
    console.log('persistence service');
    this.connectToStorage();
  }

  private async connectToStorage(): Promise<void> {
      console.log(path.join(__dirname, '../../model/**/*.entity.js'));
    const connectionOptions = Object.assign(
      {
        entities: [path.join(__dirname, '../../model/**/*.entity.js')],
        synchronize: true,
        logging: false,
      },
      this.configurationService.databaseConfiguration,
    ) as ConnectionOptions;

    await createConnection(connectionOptions);
    this.connectionReadyEvent.post();
  }
}
