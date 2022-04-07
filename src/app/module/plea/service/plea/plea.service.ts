import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import {
  Company,
  Plea,
  Pleagan,
  Product,
  UpdatePleaDto
} from '../../../../model';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

export type OrderByOptions = 'companyName' | 'productName' | 'createdAt' | 'numberOfSupports';
export type SortDirection = 'ASC' | 'DESC';

export interface PleaQueryOptions {
  productName?: string;
  companyName?: string;
  orderBy?: OrderByOptions;
  direction?: SortDirection;
}

@Injectable()
export class PleaService {
  private nameSpace = 'plea-service';
  private pleaRepository: Repository<Plea>;
  constructor(
    private persistenceService: PersistenceService,
  ) {
    this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
  }

  private initialiseRepository = (): void => {
    this.pleaRepository = getRepository(Plea);
  };

  private generatePleasQuery( withPleaganUid?: boolean ): SelectQueryBuilder<Plea> {
    const query =  this.pleaRepository.createQueryBuilder( 'plea' )
        .leftJoinAndSelect( 'plea.nonVeganProduct', 'nonVeganProduct' )
        .leftJoinAndSelect( 'plea.veganProduct', 'veganProduct' )
        .leftJoinAndSelect( 'plea.company', 'company' )
        .leftJoin( 'plea.pleagan', 'pleagan' )
        .addSelect( [ 'pleagan.displayName', 'pleagan.uid' ] )
        .leftJoinAndSelect( 'plea.supports', 'support' )
        .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
        .orderBy( 'plea.createdAt', 'DESC' )
        .cache(true);

    if ( withPleaganUid ) {
      query.addSelect( [ 'pleagan.uid' ] )
    }

    return query;
  }

  // private generatePleaDetailsQuery(): SelectQueryBuilder<Plea> {
  //   const query = this.pleaRepository.createQueryBuilder( 'plea' )
  //       .leftJoin( 'plea.nonVeganProduct', 'nonVeganProduct' )
  //       .addSelect( [ 'nonVeganProduct.name', 'nonVeganProduct.imageUrl' ] )
  //       .leftJoin( 'plea.veganProduct', 'veganProduct' )
  //       .addSelect( [ 'veganProduct.name', 'veganProduct.imageUrl' ] )
  //       .leftJoin( 'plea.company', 'company' )
  //       .addSelect( [ 'company.name' ] )
  //       .leftJoin( 'plea.pleagan', 'pleagan' )
  //       .addSelect( [ 'pleagan.displayName', 'pleagan.uid' ] )
  //       .leftJoin( 'plea.supports', 'support' )
  //       .addSelect( [ 'support.id', 'support.comment', 'support.createdAt', 'support.updatedAt', 'support.pleagan' ] )
  //       .leftJoin( 'support.pleagan', 'supporter' )
  //       .addSelect( [ 'supporter.uid', 'supporter.displayName', 'supporter.photoURL', 'supporter.country' ] )
  //       .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' );
  //
  //   return query;
  // }

  async getNumberOfSupportsByPleaId( pleaId: number ): Promise<number> {
    return (await this.pleaRepository.createQueryBuilder( 'plea' )
        .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
        .where( 'plea.id = :id', { id: pleaId } )
        .getOne()).numberOfSupports += 1;
  }

  async getAllPleas( uid?: string ): Promise<Plea[]> {
    const allPleas = this.correctSupportCounts(await this.generatePleasQuery( !!uid )
        .getMany());

    if ( uid ) {
      await this.checkSupported( allPleas, uid );
    }

    return allPleas;
  };

  async getAllPleasToCompany( companyId: number, uid?: string ): Promise<Plea[]> {
    const allPleas = this.correctSupportCounts(await this.generatePleasQuery( !!uid )
        .where('company.id = :companyId', { companyId })
        .getMany());

    if ( uid ) {
      await this.checkSupported( allPleas, uid );
    }

    return allPleas;
  };

  async getPleasFromCurrentUser( uid: string ): Promise<Plea[]> {
      return this.correctSupportCounts( await this.generatePleasQuery()
          .where( 'pleagan.uid = :uid', { uid } )
          .getMany());
  }

  async getSupportedPleasByPleagan( uid: string ): Promise<Plea[]> {
      return this.correctSupportCounts( await this.generatePleasQuery()
          .where( 'support.pleagan__uid = :uid', { uid } )
          .getMany());
  }

  async getPleaById( id: number ): Promise<Plea> {
    try {
      return this.correctSupportCount( await this.generatePleasQuery()
          .where( 'plea.id = :id', { id } )
          .getOneOrFail());
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`Plea with id ${id} could not be found.`);
      }
    }
  }

  async addPlea( description: string, company: Company, pleagan: Pleagan, product: Product ): Promise<Plea> {
    try {
      // Construct plea instance
      return await this.createPlea( description, company, pleagan, product );
    } catch ( e ) {
      console.log(e);
    }
  }

  async updatePlea( pleaId: number, plea: UpdatePleaDto, pleaganUid: string ): Promise<void> {
    const results = await this.pleaRepository
        .createQueryBuilder()
        .update( Plea )
        .set({ description: plea.description })
        .where( 'plea.id = :id AND pleagan.uid = :uid', { id: pleaId, uid: pleaganUid } )
        .execute();
    if ( !results.affected ) {
      throw new ForbiddenException(`You can only update your own pleas.`);
    }
  }

  // @TODO: re-enable later
  // async addVeganProduct(id: number, veganProduct: IProduct): Promise<Plea> {
  //   const plea = await this.getPleaById(id);
  //   plea.veganProduct = await this.productService.createProduct(
  //     veganProduct.name,
  //     veganProduct.vegan,
  //     veganProduct.imageUrl,
  //   );
  //   plea.status = PLEA_STATUS.COMPLIED;
  //
  //   return this.pleaRepository.save(plea);
  // }

  async searchPleas( params: PleaQueryOptions ): Promise<Plea[]> {

    try {
      return this.correctSupportCounts( await this.pleaRepository.find({
        where: (qb: SelectQueryBuilder<Plea[]>) => PleaService.buildSearchQuery(qb, params),
      }));
    } catch( e ) {
      console.log(e);
    }
  }

  private async checkSupported( pleas: Plea[], uid: string ): Promise<Plea[]> {
    const supportedPleas = await this.getSupportedPleasByPleagan( uid );
    pleas.forEach( ( plea: Plea ) => {
      plea.userHasSupported = !!supportedPleas.find( ( supportedPlea: Plea ) => supportedPlea.id === plea.id ) || plea.pleagan.uid == uid;
      delete plea.pleagan;
    } )

    return pleas;
  }

  private async createPlea(description: string, company: Company, initiator: Pleagan, nonVeganProduct: Product ): Promise<Plea> {
    try {
      return await this.pleaRepository.save(new Plea( description, company, initiator, nonVeganProduct ));
    } catch ( e ) {
      console.log( e );
    }
  }

  private correctSupportCounts( pleas: Plea[] ): Plea[] {
    return pleas.map( this.correctSupportCount );
  }

  private correctSupportCount = ( plea: Plea ): Plea => {
    plea.numberOfSupports++;
    return plea;
  };

  private static buildSearchQuery (
    qb: SelectQueryBuilder<Plea[]>,
    query: PleaQueryOptions,
  ): void {
    let queryString = '';
    const params = {};

    if (query.productName) {
      queryString += 'Plea_nonVeganProduct.name REGEXP :productName';
      params['productName'] = query.productName;
    }

    if (query.productName && query.companyName) {
      queryString += ' OR ';
    }

    if (query.companyName) {
      queryString += 'Plea_company.name REGEXP :companyName';
      params['companyName'] = query.companyName;
    }

    qb.leftJoinAndSelect( 'Plea.pleagan', 'pleagan' )
        .addSelect('pleagan.settings')
        .loadRelationCountAndMap( 'Plea.numberOfSupports', 'Plea.supports' )
        .cache( true )
        .where( queryString, params );

    PleaService.buildOrderByQuery( qb, query );
  }

  private static buildOrderByQuery(
    qb: SelectQueryBuilder<Plea[]>,
    query: PleaQueryOptions,
  ): void {
    if ( query.orderBy ) {
      qb.orderBy( PleaService.mapParamToQuery( query.orderBy ), query.direction )
    }
  }

  private static mapParamToQuery( param: string ): string {
    switch ( param ) {
      case 'companyName':
        return 'Plea_company.name';
      case 'productName':
        return 'Plea_nonVeganProduct.name';
      case 'numberOfSupports':
        return 'Plea.numberOfSupports';
      case 'createdAt':
        return 'Plea.createdAt';
    }
  }
}
