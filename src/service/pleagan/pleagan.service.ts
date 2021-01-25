import { Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Pleagan } from '../../model/pleagan';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  private initialiseRepository = (): void => {
    this.pleaganRepository = getRepository(Pleagan);
  };

  createPleagan(name: string, email: string, message?: string, location?: string): Pleagan {
    return this.pleaganRepository.create(new Pleagan(name, email, message, location));
  }
}
