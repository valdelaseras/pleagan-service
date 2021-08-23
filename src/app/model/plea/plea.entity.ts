import { Pleagan } from '../pleagan';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../product';
import { Support } from '../support';
import { PLEA_STATUS } from './plea-status.enum';
import { Company } from '../company';

@Entity()
export class Plea {
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
    eager: true,
  })
  @JoinColumn()
  company: Company;

  @ManyToOne((type) => Pleagan, (pleagan) => pleagan.initiatedPleas )
  @JoinColumn()
  pleagan: Pleagan;

  @OneToMany((type) => Support, (support) => support.plea )
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

  numberOfSupports: number;
  userHasSupported: boolean;

  constructor(
    description: string,
    company: Company,
    initiator: Pleagan,
    nonVeganProduct: Product,
  ) {
    this.description = description;
    this.company = company;
    this.pleagan = initiator;
    this.nonVeganProduct = nonVeganProduct;
  }
}
