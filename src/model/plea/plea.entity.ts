import { Company } from '../company/base/company.entity';
import { Pleagan } from '../pleagan/pleagan.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PLEA_STATUS } from 'pleagan-model';

@Entity()
export class Plea {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  status: PLEA_STATUS;

  creationTimestamp: string;
  company: Company;
  initiator: Pleagan;
  supporters: Pleagan[];

  @Column()
  imageUrl: string;
  constructor(
    creationTimestamp: string,
    company: Company,
    status: PLEA_STATUS,
    initiator: Pleagan,
    supporters: Pleagan[],
    imageUrl: string,
  ) {
    this.creationTimestamp = creationTimestamp;
    this.company = company;
    this.status = status;
    this.initiator = initiator;
    this.supporters = supporters;
    this.imageUrl = imageUrl;
  }
}
