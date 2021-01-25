import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IProduct } from 'pleagan-model';

@Entity()
export class Product implements IProduct {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  name: string;

  @Column()
  vegan: boolean;

  @Column('simple-array')
  animalIngredients: string[];

  constructor(name: string, vegan: boolean, animalIngredients?: string[]) {
    this.name = name;
    this.vegan = vegan;
    this.animalIngredients = animalIngredients || [];
  }
}
