import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPlea, IProduct, PLEA_STATUS } from 'pleagan-model';
import { getRepository, QueryFailedError, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';
import { LoggerService } from '../logger/logger.service';
import { Company, Plea, Pleagan, Product } from '../../model';
import { ProductService } from '../product/product.service';
import { PleaganService } from '../pleagan/pleagan.service';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CompanyService } from '../company/company.service';
import { IComment } from '../../model/plea/comment.interface';
import { Support } from '../../model/plea/support.entity';

const mockPleagan = new Pleagan(
    'some-stupid-uuid',
  'DolphinOnWheels',
  'cetaceanrave@sea.com',
  false
);

const mockSupport = new Support('I really like this shit');
mockSupport.supporter = mockPleagan;

const mockPleas = [
  new Plea(
      'I really like this shit',
    new Company('Kapiti Icecream'),
    mockPleagan,
    new Product('Boysenberry Icecream', false, 'kapiti.jpg'),
      [mockSupport]
  ),
  new Plea(
      'I really like this shit',
    new Company('Quorn'),
    mockPleagan,
    new Product('Vegetarian Meal Meat Free Soy Free Pieces', false, 'quorn.jpeg'),
      [mockSupport]
  ),
  new Plea(
      'I really like this shit',
    new Company('Stoneleigh'),
    mockPleagan,
    new Product('Sauvignon Blanc', false, 'stoneleigh.jpeg'),
      [mockSupport]
  ),
];

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
    if ((process.env.debug = 'true')) {
      this.insertMockEntities();
    }
  };

  getAllPleas(): Promise<Plea[]> {
    return this.__pleaRepository__.find({
      relations: ['supports']
    });
  }

  async getPleasByPleagan( uid: string ): Promise<Plea[]> {
    return this.__pleaRepository__.find({
      relations: ['supports'],
      where: {
        initiator: {
          uid
        }
      }
    })
  }

  async getSupportsByPleagan( uid: string ): Promise<Support[]> {
    return this.__supportRepository__.find({
      relations: ['plea'],
      where: {
        supporter: {
          uid
        }
      }
    });
  }

  async getPleaById(id: number): Promise<Plea> {
    try {
      return await this.__pleaRepository__.findOneOrFail({
          relations: ['supports', 'initiator'],
          where: {
            id
          }
      });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.__namespace__);
        throw new NotFoundException(`Plea with id ${id} could not be found.`);
      }
    }
  }

  async addPlea({ description, company, nonVeganProduct }: IPlea, pleaganUid: string): Promise<Plea> {
    // Create and save a new product
    const _nonVeganProduct = await this.productService.createProduct(
      nonVeganProduct.name,
      false,
      nonVeganProduct.imageUrl,
      nonVeganProduct.animalIngredients,
    );

    // Retrieve pleagan entity of user that initiated this plea
    const _initiator = await this.pleaganService.getPleaganByUid( pleaganUid );

    // Get company if it is known, create and save if it isn't
    const _company = await this.companyService.getOrCreateAndSaveCompany( company.name );

    const support = await this.createSupport( description );
    support.supporter = _initiator;

    // Construct plea instance
    const _plea = this.createPlea( description, _company, _initiator, _nonVeganProduct, [ support ] );
    support.plea = _plea;

    // Save and return promise
    await this.__pleaRepository__.save(_plea);
    await this.updateSupport( support );
    return _plea;
  }

  private async updateSupport( support: Support ): Promise<UpdateResult> {
    return this.__supportRepository__.update( support.id, support);
  }

  async supportPlea(id: number, { comment }: IComment, pleaganUid: string): Promise<Plea> {
    const plea = await this.getPleaById(id);
    const pleagan = await this.pleaganService.getPleaganByUid( pleaganUid );
    const support = await this.createSupport( comment, plea, pleagan );

    plea.supports.push( support );
    try {
      return await this.__pleaRepository__.save(plea);
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.__namespace__);
        // @TODO return proper error. Is an error even likely here?
        throw new ConflictException(`You have already supported this plea`);
      }
    }
  }

  async addVeganProduct(id: number, veganProduct: IProduct): Promise<Plea> {
    const plea = await this.getPleaById(id);
    plea.veganProduct = await this.productService.createProduct(
      veganProduct.name,
      veganProduct.vegan,
      veganProduct.imageUrl,
    );
    plea.status = PLEA_STATUS.COMPLIED;

    return this.__pleaRepository__.save(plea);
  }

  searchPleas(query: string): Promise<Plea[]> {
    const parsedQuery = query.indexOf(' ') >= 0 ? this.parseQuery(query) : { products: [query], companies: [query] };
    return this.__pleaRepository__.find({
      where: (qb: SelectQueryBuilder<Plea[]>) => this.buildQueryString(qb, parsedQuery),
    });
  }

  createPlea(description: string, company: Company, initiator: Pleagan, nonVeganProduct: Product, supporters: Support[]): Plea {
    return this.__pleaRepository__.create(new Plea( description, company, initiator, nonVeganProduct, supporters ));
  }

  createSupport( comment: string, plea?: Plea, pleagan?: Pleagan): Promise<Support> {
    const support =  new Support( comment );

    if ( plea ) {
      support.plea = plea;
    }

    if ( pleagan ) {
      support.supporter = pleagan;
    }

    return this.__supportRepository__.save( support );
  }

  private parseQuery(query: string): { companies: string[]; products: string[] } {
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

  private async insertMockEntities(): Promise<void> {
    try {
      await this.__pleaRepository__.save(mockPleas);
      LoggerService.debug('Mock plea entities were inserted successfully', this.__namespace__);
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.__namespace__);
        LoggerService.debug('Mock plea entities have already been inserted', this.__namespace__);
      }
    }
  }
}
