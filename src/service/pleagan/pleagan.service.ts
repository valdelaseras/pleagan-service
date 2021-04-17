import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Pleagan } from '../../model/pleagan';
import { IPleagan, IUserSettings } from 'pleagan-model';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { THEME } from 'pleagan-model/dist/model/pleagan/settings/user-settings.interface';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;

  constructor( private persistenceService: PersistenceService, private firebaseService: FirebaseService ) {
    this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
  }

  async createPleagan( uid: string, displayName: string, photoURL: string, country: string ): Promise<void> {
    try {
      const pleagan = new Pleagan( uid, displayName, photoURL, country );
      pleagan.settings = this.generateSettings();
      await this.pleaganRepository.save( pleagan );
    } catch (e) {
      console.log(e);
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        await this.firebaseService.removeUser( uid );
        throw new ConflictException(`Username ${ displayName } is already taken. Please enter a different one.`);
      }
    }
  }

  async getCurrentPleagan( uid: string ): Promise<Pleagan> {
    try {
      return await this.pleaganRepository.findOneOrFail({
        select: [
          'uid',
          'displayName',
          'photoURL',
          'country',
          'settings'
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

  async getPleaganByUid( uid: string ): Promise<Pleagan> {
    try {
      return this.finalisePleagan( await this.pleaganRepository.findOneOrFail({
        select: [
          'uid',
          'displayName',
          'photoURL',
          'country',
          'settings',
        ],
        where: {
          uid
        }
      }));
    } catch (e) {
      console.log(e);
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.namespace);
        throw new NotFoundException(`Pleagan with uid ${ uid } could not be found.`);
      }
    }
  }

  async getFullPleaganByUid( uid: string ): Promise<Pleagan> {
    try {
      return await this.pleaganRepository.findOneOrFail({
        select: [
          'uid',
          'displayName',
          'photoURL',
          'settings',
          'country',
        ],
        where: {
          uid
        }
      });
    } catch (e) {
      console.log(e);
      if ( e instanceof EntityNotFoundError ) {
        LoggerService.warn( e.message, this.namespace );
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

  finalisePleagan( pleagan: Pleagan ): Pleagan {
    if ( !pleagan ) return;
    pleagan.country = pleagan.settings.countryPrivate ? null : pleagan.country;
    pleagan.settings = null;
    return pleagan;
  }

  private initialiseRepository = (): void => {
    this.pleaganRepository = getRepository(Pleagan);
  };

  private generateSettings(): IUserSettings {
    return {
      theme: THEME.DEFAULT,
      countryPrivate: false,
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
    }
  }
}
