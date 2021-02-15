import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPlea, IPleagan, IProduct, PLEA_STATUS } from 'pleagan-model';
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
  'Wellington',
);

const mockPleas = [
  new Plea(
    PLEA_STATUS.UNNOTIFIED,
    new Company('Kapiti Icecream'),
    mockPleagan,
    new Product('Boysenberry Icecream', false, 'kapiti.jpg'),
    null,
    [mockPleagan],
  ),
  new Plea(
    PLEA_STATUS.COMPLIED,
    new Company('Quorn'),
    mockPleagan,
    new Product('Vegetarian Meal Meat Free Soy Free Pieces', false, 'quorn.jpeg'),
    new Product('Vegan Meal Meat Free Soy Free Pieces', true, 'quorn.jpeg'),
    [mockPleagan],
  ),
  new Plea(
    PLEA_STATUS.UNNOTIFIED,
    new Company('Stoneleigh'),
    mockPleagan,
    new Product('Sauvignon Blanc', false, 'stoneleigh.jpeg'),
    null,
    [mockPleagan],
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
      return await this.pleaRepository.findOneOrFail({ id: id });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        LoggerService.warn(e.message, this.namespace);
        throw new NotFoundException(`Plea with id ${id} could not be found.`);
      }
    }
  }

  async addPlea({ company, initiator, nonVeganProduct }: IPlea): Promise<Plea> {
    const _nonVeganProduct = await this.productService.createProduct(
      nonVeganProduct.name,
      false,
      nonVeganProduct.imageUrl,
      nonVeganProduct.animalIngredients,
    );
    const _initiator = await this.pleaganService.createPleagan(
      initiator.displayName,
      initiator.email,
      initiator.country,
    );
    const _company = await this.companyService.createCompany(company.name);
    const _plea = this.createPlea(PLEA_STATUS.UNNOTIFIED, _company, _initiator, _nonVeganProduct);
    return await this.pleaRepository.save(_plea);
  }

  async supportPlea(id: number, { displayName, email, country }: IPleagan): Promise<Plea> {
    const plea = await this.getPleaById(id);

    if (plea.supporters.find((pleagan: Pleagan) => pleagan.email === email)) {
      throw new ConflictException(`Pleagan with email address ${email} has already supported this plea.`);
    }

    plea.supporters.push(new Pleagan(displayName, email, country));

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

  createPlea(status: PLEA_STATUS, company: Company, initiator: Pleagan, nonVeganProduct: Product): Plea {
    return this.pleaRepository.create(new Plea(status, company, initiator, nonVeganProduct, null, [initiator]));
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
      console.log(e);
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        LoggerService.debug('Mock plea entities have already been inserted', this.namespace);
      }
    }
  }
}
