import { ConflictException, Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Pleagan } from '../../model/pleagan';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  async createPleagan(name: string, email: string, message?: string, location?: string): Promise<Pleagan> {
    try {
      const pleagan = this.pleaganRepository.create(new Pleagan(name, email, message, location));
      await this.pleaganRepository.save(pleagan);

      return pleagan;
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        // @TODO return proper error. Is an error even likely here?
        throw new ConflictException(`Oopsie doopsie`);
      }
    }
  }

  private initialiseRepository = (): void => {
    this.pleaganRepository = getRepository(Pleagan);
  };
}
