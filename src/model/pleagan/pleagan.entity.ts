import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Plea } from '../plea';
import { IPleagan } from 'pleagan-model';

@Entity()
export class Pleagan implements IPleagan {
  @PrimaryColumn()
  uid: string;

  @Column()
  email: string;

  @Column()
  emailVerified: boolean;

  @Column()
  displayName?: string;

  @Column()
  country?: string;

  @OneToMany((type) => Plea, (plea) => plea.initiator)
  initiatedPleas?: Plea[];

  @ManyToMany((type) => Plea, (plea) => plea.supporters)
  supportedPleas?: Plea[];

  constructor(displayName: string, email: string, country?: string) {
    this.displayName = displayName;
    this.email = email;
    this.country = country || undefined;
  }
}
