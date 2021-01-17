import { Product } from '../product/product.model';

export class Company {
  id: string;
  name: string;
  product: Product;
  constructor(id: string, name: string, product: Product) {
    this.id = id;
    this.name = name;
    this.product = product;
  }
}
