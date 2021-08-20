import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  name: string;

  @Column()
  vegan: boolean;

  @Column()
  imageUrl: string;

  @Column('simple-array' )
  animalIngredients: string[];

  constructor(name: string, vegan: boolean, imageUrl: string, animalIngredients?: string[]) {
    this.name = name;
    this.vegan = vegan;
    this.imageUrl = imageUrl;
    this.animalIngredients = animalIngredients;
  }
}
