import {  Injectable, NotFoundException } from '@nestjs/common';
import { IPlea, IProduct, PLEA_STATUS } from 'pleagan-model';
import { getRepository, QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';
import { LoggerService } from '../logger/logger.service';
import { Company, Plea, Pleagan, Product } from '../../model';
import { ProductService } from '../product/product.service';
import { PleaganService } from '../pleagan/pleagan.service';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CompanyService } from '../company/company.service';

const mockPleagan = new Pleagan(
    'some-stupid-uuid',
  'DolphinOnWheels',
  'cetaceanrave@sea.com',
  false
);

const mockPleas = [
  new Plea(
      'lorem ipsum',
    new Company('Kapiti Icecream'),
    mockPleagan,
    new Product('Boysenberry Icecream', false, 'kapiti.jpg'),
      [mockPleagan]
  ),
  new Plea(
      'lorem ipsum',
    new Company('Quorn'),
    mockPleagan,
    new Product('Vegetarian Meal Meat Free Soy Free Pieces', false, 'quorn.jpeg'),
      [mockPleagan]
  ),
  new Plea(
      'lorem ipsum',
    new Company('Stoneleigh'),
    mockPleagan,
    new Product('Sauvignon Blanc', false, 'stoneleigh.jpeg'),
      [mockPleagan]
  ),
];

@Injectable()
export class PleaService {
  private namespace = 'plea-service';
  private pleaRepository: Repository<Plea>;
  constructor(
    private persistenceService: PersistenceService,
    private productService: ProductService,
    private companyService: CompanyService,
    private pleaganService: PleaganService,
  ) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  private initialiseRepository = (): void => {
    this.pleaRepository = getRepository(Plea);
    if ((process.env.debug = 'true')) {
      this.insertMockEntities();
    }
  };

  getAllPleas(): Promise<Plea[]> {
    return this.pleaRepository.find();
  }

  async getPleaById(id: number): Promise<Plea> {
    try {
      return await this.pleaRepository.findOneOrFail({ id });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.namespace);
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

    // Construct plea instance
    const _plea = this.createPlea( description, _company, _initiator, _nonVeganProduct, [ _initiator ] );

    // Save and return promise
    return await this.pleaRepository.save(_plea);
  }

  async supportPlea(id: number, pleaganUid: string): Promise<Plea> {
    const plea = await this.getPleaById(id);
    const pleagan = await this.pleaganService.getPleaganByUid( pleaganUid );

    // @TODO: fix
    // if (plea.supporters.find((pleagan: Pleagan) => pleagan.email === email)) {
    //   throw new ConflictException(`Pleagan with email address ${email} has already supported this plea.`);
    // }

    plea.supporters.push( pleagan );

    return this.pleaRepository.save(plea);
  }

  async addVeganProduct(id: number, veganProduct: IProduct): Promise<Plea> {
    const plea = await this.getPleaById(id);
    plea.veganProduct = await this.productService.createProduct(
      veganProduct.name,
      veganProduct.vegan,
      veganProduct.imageUrl,
    );
    plea.status = PLEA_STATUS.COMPLIED;

    return this.pleaRepository.save(plea);
  }

  searchPleas(query: string): Promise<Plea[]> {
    const parsedQuery = query.indexOf(' ') >= 0 ? this.parseQuery(query) : { products: [query], companies: [query] };
    return this.pleaRepository.find({
      where: (qb: SelectQueryBuilder<Plea[]>) => this.buildQueryString(qb, parsedQuery),
    });
  }

  createPlea(description: string, company: Company, initiator: Pleagan, nonVeganProduct: Product, supporters: Pleagan[]): Plea {
    return this.pleaRepository.create(new Plea( description, company, initiator, nonVeganProduct, supporters ));
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
      await this.pleaRepository.save(mockPleas);
      LoggerService.debug('Mock plea entities were inserted successfully', this.namespace);
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        LoggerService.debug('Mock plea entities have already been inserted', this.namespace);
      }
    }
  }
}
