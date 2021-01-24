import { Injectable } from '@nestjs/common';
import { Plea } from '../../model/plea/plea.entity';
import { Company } from '../../model/company/base/company.entity';
import { IPlea, PLEA_STATUS } from 'pleagan-model';
import { Pleagan } from '../../model/pleagan/pleagan.entity';
import { Product } from '../../model/product/product.entity';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';
import { LoggerService } from '../logger/logger.service';

const mockPleagan = new Pleagan(
  '1',
  'DolphinOnWheels',
  'cetaceanrave@sea.com',
  'I loved this product so much and used to buy it a lot. Giving it up after going vegan has ' +
    'been hard but it needed to be done. I would be so happy if you could create a vegan ' +
    'version of this!',
  'Wellington',
);

const mockPleas = [
  new Plea(
    '2021-02-01T01:00:00+12:00',
    new Company('1', 'Kapiti Icecream', [new Product('1', 'Boysenberry Icecream', false)]),
    PLEA_STATUS.UNNOTIFIED,
    mockPleagan,
    [mockPleagan],
    'kapiti.jpg',
  ),
  new Plea(
    '2021-02-02T01:00:00+12:00',
    new Company('2', 'Quorn', [
      new Product('2', 'Vegetarian Meal Meat Free Soy Free Pieces', false),
      new Product('4', 'Vegan Meal Meat Free Soy Free Pieces', true),
    ]),
    PLEA_STATUS.COMPLIED,
    mockPleagan,
    [mockPleagan],
    'quorn.jpeg',
  ),
  new Plea(
    '2021-02-03T01:00:00+12:00',
    new Company('3', 'Stoneleigh', [new Product('3', 'Sauvignon Blanc', false)]),
    PLEA_STATUS.UNNOTIFIED,
    mockPleagan,
    [mockPleagan],
    'stoneleigh.jpeg',
  ),
];

@Injectable()
export class PleaService {
  private namespace = 'plea-service';
  private pleaRepository: Repository<Plea>;
  constructor(private persistenceService: PersistenceService) {
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

  getPleaById(id: string): Promise<Plea> {
    return this.pleaRepository.findOne({ id: id });
  }

  addPlea( {creationTimestamp, company, status, initiator, supporters, imageUrl}: IPlea ): Promise<Plea> {
    const _plea = new Plea( creationTimestamp, company, status, initiator, supporters, imageUrl);
    return this.pleaRepository.save( _plea );
  }

  private async insertMockEntities(): Promise<void> {
    try {
      await this.pleaRepository.save(mockPleas);
      LoggerService.debug('Mock plea entities were inserted successfully', this.namespace);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        LoggerService.debug('Mock plea entities have already been inserted', this.namespace);
      }
    }
  }
}
