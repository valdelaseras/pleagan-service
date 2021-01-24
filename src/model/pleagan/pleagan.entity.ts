import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Plea } from '../plea';
import { IPleagan } from 'pleagan-model';

@Entity()
export class Pleagan implements IPleagan {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('text')
  message?: string;

  @Column()
  location?: string;

  @OneToMany((type) => Plea, (plea) => plea.initiator)
  initiatedPleas?: Plea[];

  @ManyToMany((type) => Plea, (plea) => plea.supporters)
  supportedPleas?: Plea[];

  constructor(name: string, email: string, message?: string, location?: string) {
    this.name = name;
    this.email = email;
    this.message = message || undefined;
    this.location = location || undefined;
  }
}
