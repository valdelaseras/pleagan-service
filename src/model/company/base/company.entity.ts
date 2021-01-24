import { Product } from '../../product/product.entity';

export class Company {
  id: string;
  name: string;
  products: Product[];
  constructor(id: string, name: string, products: Product[]) {
    this.id = id;
    this.name = name;
    this.products = products;
  }
}
