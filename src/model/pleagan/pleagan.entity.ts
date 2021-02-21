import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Plea } from '../plea';
import { IPleagan } from 'pleagan-model';
import { IUserSettings } from 'pleagan-model/dist/model/pleagan/settings/user-settings.interface';
import { Support } from '../plea/support.entity';

@Entity('Pleagan')
export class Pleagan implements IPleagan {
  @PrimaryColumn()
  uid: string;

  @Column({ select: false })
  email: string;

  @Column('bool')
  emailVerified = false;

  @Column()
  photoUrl?: string = '';

  @Column()
  displayName?: string = '';

  @Column()
  country?: string = '';

  @OneToMany((type) => Plea, (plea) => plea.initiator)
  initiatedPleas?: Plea[];

  @OneToMany((type) => Support, (support) => support.supporter)
  supports?: Support[];

  settings: IUserSettings;

  constructor(uid: string, displayName: string, email: string, emailVerified: boolean, country?: string) {
    this.uid = uid;
    this.displayName = displayName;
    this.email = email;
    this.country = country || '';
    this.emailVerified = emailVerified;
  }
}
