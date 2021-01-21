export class Product {
  id: string;
  name: string;
  vegan: boolean;
  ingredients: string[];
  constructor(id: string, name: string, vegan: boolean, ingredients?: string[] ) {
    this.id = id;
    this.name = name;
    this.vegan = vegan;
    this.ingredients = ingredients || [];
  }
}
