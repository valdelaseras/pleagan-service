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
import { Support } from './support.entity';

@Entity()
export class Plea implements IPlea {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  status: PLEA_STATUS = PLEA_STATUS.UNNOTIFIED;

  @Column('text')
  description: string;

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
  })
  initiator: Pleagan;

  @ManyToMany((type) => Support, (support) => support.plea, {
    cascade: true,
  })
  @JoinTable()
  supports: Support[];

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
    description: string,
    company: Company,
    initiator: Pleagan,
    nonVeganProduct: Product,
    supports: Support[]
  ) {
    this.description = description;
    this.company = company;
    this.initiator = initiator;
    this.nonVeganProduct = nonVeganProduct;
    this.supports = supports;
  }
}
