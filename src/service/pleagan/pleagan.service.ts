import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Pleagan } from '../../model/pleagan';
import { IPleagan } from 'pleagan-model';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { THEME } from 'pleagan-model/dist/model/pleagan/settings/user-settings.interface';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  async createPleagan( uid: string, displayName: string, photoURL: string): Promise<void> {
    try {
      const pleagan = new Pleagan(uid, displayName, photoURL );
      pleagan.settings = {
        theme: THEME.DEFAULT,
        notifications: {
          push: {
            enabled: false,
            news: false,
            myPleas: {
              onCompliance: false,
              onThreshold: false,
            },
            otherPleas: {
              onLocation: false,
              onNew: false,
            },
            supportedPleas: {
              onCompliance: false,
              onThreshold: false,
            }
          },

          email: {
            enabled: false,
            news: false,
            myPleas: {
              onCompliance: false,
              onThreshold: false,
            },
            otherPleas: {
              onLocation: false,
              onNew: false,
            },
            supportedPleas: {
              onCompliance: false,
              onThreshold: false,
            }
          }
        }
      };
      await this.pleaganRepository.save( pleagan );
    } catch (e) {
      console.log(e);
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
        select: [
          'uid',
          'displayName',
          'photoURL',
          'country',
        ],
        where: {
          uid
        }
      });
    } catch (e) {
      console.log(e);
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.namespace);
        throw new NotFoundException(`Pleagan with uid ${ uid } could not be found.`);
      }
    }
  }

  async updatePleagan( uid: string, pleagan: IPleagan ): Promise<void> {
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
