import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../../../shared/service/logger/logger.service';
import { UpdatePleaganDto, Pleagan } from '../../../../model/pleagan';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FirebaseService } from '../../../shared/service/firebase/firebase.service';

@Injectable()
export class PleaganService {
  private namespace = 'pleagan-service';
  pleaganRepository: Repository<Pleagan>;

  constructor(
      private persistenceService: PersistenceService,
      private firebaseService: FirebaseService
  ) {
    this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
  }

  async savePleagan( pleagan: Pleagan ): Promise<Pleagan> {
    return this.pleaganRepository.save( pleagan );
  }

  async createPleagan( uid: string, displayName: string, photoURL: string, country: string ): Promise<Pleagan> {
    try {
      const pleagan = new Pleagan( uid, displayName, photoURL, country );
      return await this.pleaganRepository.save( pleagan );
    } catch (e) {
      console.log(e);
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        await this.firebaseService.removeUser( uid );
        throw new ConflictException(`Username ${ displayName } is already taken. Please enter a different one.`);
      }
    }
  }

  // async getPleaganToNotify( uid: string ): Promise<Pleagan> {
  //   return this.pleaganRepository.createQueryBuilder( 'pleagan' )
  //       .leftJoinAndSelect( 'pleagan.devices', 'device' )
  //       .leftJoinAndSelect( 'pleagan.inbox', 'inbox' )
  //       .where( 'pleagan.uid = :uid', { uid } )
  //       .getOneOrFail();
  // }

  // async getSupportersToNotify( pleaId: number ): Promise<Pleagan[]> {
  //   return this.pleaganRepository.createQueryBuilder( 'pleagan' )
  //       .leftJoinAndSelect( 'pleagan.devices', 'device' )
  //       .leftJoinAndSelect( 'pleagan.inbox', 'inbox' )
  //       .leftJoin( 'pleagan.supports', 'support' )
  //       .where( 'support.plea__id = :pleaId', { pleaId } )
  //       .getMany();
  // }

  // async getCurrentPleagan( uid: string ): Promise<Pleagan> {
  //   try {
  //     return this.pleaganRepository.createQueryBuilder( 'pleagan' )
  //         .where( 'pleagan.uid = :uid', { uid } )
  //         .getOneOrFail();
  //   } catch (e) {
  //     console.log(e);
  //     if (e instanceof EntityNotFoundError) {
  //       LoggerService.warn(e.message, this.namespace);
  //       throw new NotFoundException(`Pleagan with uid ${ uid } could not be found.`);
  //     }
  //   }
  // }

  async getPleaganByUid( uid: string ): Promise<Pleagan> {
    try {
      return this.pleaganRepository.createQueryBuilder( 'pleagan' )
          .where( 'pleagan.uid = :uid', { uid } )
          .getOneOrFail();
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

  async updatePleagan( uid: string, pleagan: UpdatePleaganDto ): Promise<void> {
    try {
      await this.pleaganRepository.update( uid, pleagan );
    } catch (e) {
      console.log( e );
    }
  }

  // finalisePleagan( pleagan: Pleagan ): Pleagan {
  //   pleagan.country = pleagan.settings.countryPrivate ? null : pleagan.country;
  //   return pleagan;
  // }

  private initialiseRepository = (): void => {
    this.pleaganRepository = getRepository( Pleagan );
  };
}
