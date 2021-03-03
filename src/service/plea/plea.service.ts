import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPlea, IProduct, PLEA_STATUS } from 'pleagan-model';
import { getRepository, In, QueryFailedError, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';
import { LoggerService } from '../logger/logger.service';
import { Company, Plea, Pleagan, Product } from '../../model';
import { ProductService } from '../product/product.service';
import { PleaganService } from '../pleagan/pleagan.service';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CompanyService } from '../company/company.service';
import { IComment } from '../../model/plea/comment.interface';
import { Support } from '../../model/plea/support.entity';

@Injectable()
export class PleaService {
  private __namespace__ = 'plea-service';
  private __pleaRepository__: Repository<Plea>;
  private __supportRepository__: Repository<Support>;
  constructor(
    private persistenceService: PersistenceService,
    private productService: ProductService,
    private companyService: CompanyService,
    private pleaganService: PleaganService,
  ) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  private initialiseRepository = (): void => {
    this.__pleaRepository__ = getRepository(Plea);
    this.__supportRepository__ = getRepository(Support);
  };

  // @TODO: return count of supports instead of entity instances
  async getAllPleas(): Promise<Plea[]> {
    return (await this.__pleaRepository__
        .createQueryBuilder( 'plea' )
        .leftJoinAndSelect( 'plea.nonVeganProduct', 'nonVeganProduct' )
        .leftJoinAndSelect( 'plea.veganProduct', 'veganProduct' )
        .leftJoinAndSelect( 'plea.company', 'company' )
        .leftJoinAndSelect( 'plea.pleagan', 'pleagan' )
        .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
        .cache(true)
        .getMany()
    ).map( ( plea: Plea ) => {
      plea.numberOfSupports++;
      return plea;
    });
  };

  async getPleasFromCurrentUser( uid: string ): Promise<Plea[]> {
      return (await this.__pleaRepository__
          .createQueryBuilder( 'plea' )
          .leftJoinAndSelect( 'plea.nonVeganProduct', 'nonVeganProduct' )
          .leftJoinAndSelect( 'plea.veganProduct', 'veganProduct' )
          .leftJoinAndSelect( 'plea.company', 'company' )
          .leftJoinAndSelect( 'plea.pleagan', 'pleagan' )
          .leftJoinAndSelect( 'plea.supports', 'supports' )
          .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
          .cache(true)
          .where( 'pleagan.uid = :uid', { uid } )
          .getMany()
      ).map( ( plea: Plea ) => {
        plea.numberOfSupports++;
        return plea;
      });
  }

  async getSupportedPleasByPleagan( uid: string ): Promise<Plea[]> {
    return (await this.__pleaRepository__
            .createQueryBuilder( 'plea' )
            .leftJoinAndSelect( 'plea.nonVeganProduct', 'nonVeganProduct' )
            .leftJoinAndSelect( 'plea.veganProduct', 'veganProduct' )
            .leftJoinAndSelect( 'plea.company', 'company' )
            .leftJoinAndSelect( 'plea.pleagan', 'pleagan' )
            .leftJoinAndSelect( 'plea.supports', 'support' )
            .leftJoinAndSelect( 'support.pleagan', 'supporter' )
            .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
            .cache(true)
            .where( 'support.pleagan__uid = :uid', { uid } )
            .getMany()
    ).map( ( plea: Plea ) => {
      plea.numberOfSupports++;
      return plea;
    });
  }

  async getPleaById(id: number): Promise<Plea> {
    try {
      const plea = await this.__pleaRepository__
              .createQueryBuilder( 'plea' )
              .leftJoinAndSelect( 'plea.nonVeganProduct', 'nonVeganProduct' )
              .leftJoinAndSelect( 'plea.veganProduct', 'veganProduct' )
              .leftJoinAndSelect( 'plea.company', 'company' )
              .leftJoinAndSelect( 'plea.pleagan', 'pleagan' )
              .leftJoinAndSelect( 'plea.supports', 'support' )
              .leftJoinAndSelect( 'support.pleagan', 'supporter' )
              .loadRelationCountAndMap( 'plea.numberOfSupports', 'plea.supports' )
              .cache(true)
              .where( 'plea.id = :id', { id } )
              .getOneOrFail();

      plea.numberOfSupports++;
      return plea;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        // FIXME: do not log every 404
        // LoggerService.warn(e.message, this.__namespace__);
        throw new NotFoundException(`Plea with id ${id} could not be found.`);
      }
    }
  }

  async addPlea({ description, company, nonVeganProduct }: IPlea, pleaganUid: string): Promise<Plea> {
    try {
      // Create and save a new product
      const _nonVeganProduct = await this.productService.createProduct(
          nonVeganProduct.name,
          false,
          nonVeganProduct.imageUrl,
          nonVeganProduct.animalIngredients,
      );

      // Retrieve pleagan entity of user that initiated this plea
      const pleagan = await this.pleaganService.getPleaganByUid( pleaganUid );

      // Get company if it is known, create and save if it isn't
      const _company = await this.companyService.getOrCreateAndSaveCompany( company.name );

      // Construct plea instance
      return await this.createPlea( description, _company, pleagan, _nonVeganProduct );
    } catch ( e ) {
      console.log(e);
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
  //   return this.__pleaRepository__.save(plea);
  // }

  async searchPleas(query: string): Promise<Plea[]> {
    const parsedQuery = query.indexOf(' ') >= 0 ? this.parseQuery(query) : { products: [query], companies: [query] };
    try {
      return await this.__pleaRepository__.find({
        where: (qb: SelectQueryBuilder<Plea[]>) => this.buildQueryString(qb, parsedQuery),
      });
    } catch( e ) {
      console.log(e);
    }
  }

  private async createPlea(description: string, company: Company, initiator: Pleagan, nonVeganProduct: Product ): Promise<Plea> {
    try {
      return await this.__pleaRepository__.save(new Plea( description, company, initiator, nonVeganProduct ));
    } catch ( e ) {
      console.log( e );
    }
  }

  private parseQuery( query: string ): { companies: string[]; products: string[] } {
    const parsedQuery = {
      companies: [],
      products: [],
    };

    for (const fragment of query.split(' ')) {
      if (this.productService.isKnownProduct(fragment)) {
        parsedQuery['products'].push(fragment);
      }

      if (this.companyService.isKnownCompany(fragment)) {
        parsedQuery['companies'].push(fragment);
      }
    }
    return parsedQuery;
  }

  private buildQueryString(
    qb: SelectQueryBuilder<Plea[]>,
    parsedQuery: { products: string[]; companies: string[] },
  ): void {
    let queryString = '';
    const params = {};

    if (parsedQuery.products.length) {
      queryString += 'Plea_nonVeganProduct.name REGEXP :productNames';
      params['productNames'] = parsedQuery.products.join('|');
    }

    if (parsedQuery.products.length && parsedQuery.companies.length) {
      queryString += ' OR ';
    }

    if (parsedQuery.companies.length) {
      queryString += 'Plea_company.name REGEXP :companyNames';
      params['companyNames'] = parsedQuery.companies.join('|');
    }

    qb.where(queryString, params);
  }
}
