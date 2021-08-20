import { ConflictException, Injectable } from '@nestjs/common';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { Product } from '../../../../model/product';
import { LoggerService } from '../../../shared/service/logger/logger.service';
import { Company } from '../../../../model/company';

@Injectable()
export class ProductService {
  private nameSpace = 'product-service';
  private knownProductNames: string[];
  productRepository: Repository<Product>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  isKnownProduct(name: string): boolean {
    return (
      this.knownProductNames.filter((knownProductName: string) => knownProductName.indexOf(name.toLowerCase()) >= 0)
        .length > 0
    );
  }

  getKnownProducts(): Promise<string[]> {
    return new Promise( ( resolve ) => {
      resolve( this.knownProductNames );
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async createProduct(
      name: string,
      vegan: boolean,
      imageUrl: string,
      animalIngredients: string[] = [],
  ): Promise<Product> {
    try {
      const product = this.productRepository.create(new Product(name, vegan, imageUrl, animalIngredients));
      await this.productRepository.save(product);
      this.addProductToKnownProducts(product.name);

      return product;
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.nameSpace);
        throw new ConflictException(`Product with name ${name} is already assigned to a plea.`);
      }
    }
  }

  private initialiseRepository = async (): Promise<void> => {
    this.productRepository = getRepository(Product);
    this.knownProductNames = await this.retrieveKnownProductNames();
  };

  private async retrieveKnownProductNames(): Promise<string[]> {
    const knownProducts = await this.productRepository.find({
      select: ['name'],
    });

    return knownProducts.map(({ name }) => name.toLowerCase());
  }

  private addProductToKnownProducts(name: string): void {
    if (!this.isKnownProduct(name)) {
      this.knownProductNames.push(name.toLowerCase());
    }
  }
}
