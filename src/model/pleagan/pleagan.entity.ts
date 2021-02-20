import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Plea } from '../plea';
import { IPleagan } from 'pleagan-model';
import { IUserSettings } from 'pleagan-model/dist/model/pleagan/settings/user-settings.interface';

@Entity()
export class Pleagan implements IPleagan {
  @PrimaryColumn()
  uid: string;

  @Column()
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

  @ManyToMany((type) => Plea, (plea) => plea.supporters)
  supportedPleas?: Plea[];

  settings: IUserSettings;

  constructor(uid: string, displayName: string, email: string, emailVerified: boolean, country?: string) {
    this.uid = uid;
    this.displayName = displayName;
    this.email = email;
    this.country = country || '';
    this.emailVerified = emailVerified;
  }
}
