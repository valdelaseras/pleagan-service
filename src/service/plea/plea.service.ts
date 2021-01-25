import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPlea, IPleagan, IProduct, PLEA_STATUS } from 'pleagan-model';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';
import { LoggerService } from '../logger/logger.service';
import { Plea, Pleagan, Product, Company } from '../../model';
import { ProductService } from '../product/product.service';
import { PleaganService } from '../pleagan/pleagan.service';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

const mockPleagan = new Pleagan(
  'DolphinOnWheels',
  'cetaceanrave@sea.com',
  'I loved this product so much and used to buy it a lot. Giving it up after going vegan has ' +
    'been hard but it needed to be done. I would be so happy if you could create a vegan ' +
    'version of this!',
  'Wellington',
);

const mockPleas = [
  new Plea(
    PLEA_STATUS.UNNOTIFIED,
    new Company('Kapiti Icecream'),
    mockPleagan,
    'kapiti.jpg',
    new Product('Boysenberry Icecream', false),
    null,
    [mockPleagan],
  ),
  new Plea(
    PLEA_STATUS.COMPLIED,
    new Company('Quorn'),
    mockPleagan,
    'quorn.jpeg',
    new Product('Vegetarian Meal Meat Free Soy Free Pieces', false),
    new Product('Vegan Meal Meat Free Soy Free Pieces', true),
    [mockPleagan],
  ),
  new Plea(
    PLEA_STATUS.UNNOTIFIED,
    new Company('Stoneleigh'),
    mockPleagan,
    'stoneleigh.jpeg',
    new Product('Sauvignon Blanc', false),
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
        LoggerService.warn( e.message, this.namespace);
        throw new NotFoundException(`Plea with id ${id} could not be found.`);
      }
    }
  }

  async addPlea({
    company,
    status,
    initiator,
    imageUrl,
    nonVeganProduct,
  }: IPlea): Promise<Plea> {
    const _nonVeganProduct = await this.productService.createProduct(
      nonVeganProduct.name,
      nonVeganProduct.vegan,
      nonVeganProduct.animalIngredients,
    );
    const _initiator = this.pleaganService.createPleagan(
      initiator.name,
      initiator.email,
      initiator.message,
      initiator.location,
    );

    const _plea = this.createPlea(status, company, _initiator, imageUrl, _nonVeganProduct);
    return await this.pleaRepository.save(_plea);
  }

  async supportPlea(id: number, { name, email, message, location }: IPleagan): Promise<Plea> {
    const plea = await this.getPleaById(id);

    if (plea.supporters.find((pleagan: Pleagan) => pleagan.email === email)) {
      throw new ConflictException(`Pleagan with email address ${email} has already supported this plea.`);
    }

    plea.supporters.push(new Pleagan(name, email, message, location));

    return this.pleaRepository.save(plea);
  }

  async addVeganProduct(id: number, veganProduct: IProduct): Promise<Plea> {
    const plea = await this.getPleaById(id);
    plea.veganProduct = await this.productService.createProduct(veganProduct.name, veganProduct.vegan);

    return this.pleaRepository.save(plea);
  }

  createPlea(
    status: PLEA_STATUS,
    company: Company,
    initiator: Pleagan,
    imageUrl: string,
    nonVeganProduct: Product,
  ): Plea {
    return this.pleaRepository.create(
      new Plea(status, company, initiator, imageUrl, nonVeganProduct, null, [initiator]),
    );
  }

  private async insertMockEntities(): Promise<void> {
    try {
      await this.pleaRepository.save(mockPleas);
      LoggerService.debug('Mock plea entities were inserted successfully', this.namespace);
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn( e.message, this.namespace);
        LoggerService.debug('Mock plea entities have already been inserted', this.namespace);
      }
    }
  }
}
