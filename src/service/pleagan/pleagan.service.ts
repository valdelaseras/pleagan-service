import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Pleagan } from '../../model/pleagan';
import { IPleagan } from 'pleagan-model';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  async addPleagan( { uid, displayName, email , emailVerified}: IPleagan): Promise<Pleagan> {
    try {
      const pleagan = this.pleaganRepository.create(new Pleagan(uid, displayName, email, emailVerified));
      return this.pleaganRepository.save(pleagan);
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        // @TODO return proper error. Is an error even likely here?
        throw new ConflictException(`Oopsie doopsie`);
      }
    }
  }

  async getPleaganByUid( uid: string ): Promise<Pleagan> {
    try {
      return await this.pleaganRepository.findOneOrFail({
        select: ['email'],
        where: {
          uid
        }
      });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.namespace);
        throw new NotFoundException(`Pleagan with uid ${ uid } could not be found.`);
      }
    }
  }

  async getAllPleaganUids(): Promise<Pleagan[]> {
    return await this.pleaganRepository.find({
      select: [ 'uid' ]
    });
  }

  async updatePleagan( uid: string, pleagan: IPleagan): Promise<void> {
    try {
      await this.pleaganRepository.update( uid, pleagan );
    } catch (e) {
      console.log( e );
    }
  }

  private initialiseRepository = (): void => {
    this.pleaganRepository = getRepository(Pleagan);
  };
}
