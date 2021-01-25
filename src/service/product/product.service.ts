import { ConflictException, Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { Product } from '../../model/product';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ProductService {
  private namespace = 'product-service';
  productRepository: Repository<Product>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  private initialiseRepository = (): void => {
    this.productRepository = getRepository(Product);
  };

  async createProduct(name: string, vegan: boolean, animalIngredients: string[] = []): Promise<Product> {
    try {
      const product = this.productRepository.create(new Product(name, vegan, animalIngredients));
      return await this.productRepository.save( product );
    } catch (e) {
      if ( e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn( e.message, this.namespace);
        throw new ConflictException(`Product with name ${name} is already assigned to a plea.`);
      }
    }
  }
}
