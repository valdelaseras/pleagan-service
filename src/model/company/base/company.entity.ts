import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Plea } from '../../';
import { ICompany } from 'pleagan-model';

@Entity()
export class Company implements ICompany {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @OneToMany((type) => Plea, (plea) => plea.company)
  pleas?: Plea[];

  constructor(name: string) {
    this.name = name;
  }
}
