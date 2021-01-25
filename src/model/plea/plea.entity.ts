import { Company } from '../company';
import { Pleagan } from '../pleagan';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IPlea, PLEA_STATUS } from 'pleagan-model';
import { Product } from '../product';

@Entity()
export class Plea implements IPlea {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  status: PLEA_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne((type) => Company, (company) => company.pleas, {
    cascade: true,
    eager: true,
  })
  company: Company;

  @ManyToOne((type) => Pleagan, (pleagan) => pleagan.initiatedPleas, {
    cascade: true,
    eager: true,
  })
  initiator: Pleagan;

  @ManyToMany((type) => Pleagan, (pleagan) => pleagan.supportedPleas, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  supporters: Pleagan[];

  @OneToOne(() => Product, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn()
  nonVeganProduct: Product;

  @OneToOne(() => Product, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn()
  veganProduct?: Product;

  constructor(
    status: PLEA_STATUS,
    company: Company,
    initiator: Pleagan,
    nonVeganProduct: Product,
    veganProduct: Product,
    supporters?: Pleagan[],
  ) {
    this.company = company;
    this.status = status;
    this.initiator = initiator;
    this.supporters = supporters;
    this.nonVeganProduct = nonVeganProduct;
    this.veganProduct = veganProduct;
  }
}
