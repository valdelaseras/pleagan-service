import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Plea } from '../plea';
import { IPleagan } from 'pleagan-model';
import { IUserSettings, THEME } from 'pleagan-model/dist/model/pleagan/settings/user-settings.interface';
import { Support } from '../plea/support.entity';

@Entity('Pleagan')
export class Pleagan implements IPleagan {
  @PrimaryColumn()
  uid: string;

  @Column()
  displayName: string = '';

  @Column()
  photoURL?: string = '';

  @Column({
    nullable: true
  })
  country?: string = '';

  @OneToMany((type) => Plea, (plea) => plea.pleagan )
  initiatedPleas?: Plea[];

  @OneToMany((type) => Support, (support) => support.pleagan )
  supports?: Support[];

  @Column('simple-json')
  settings: IUserSettings;

  constructor(uid: string, displayName: string, photoURL: string, country?: string) {
    this.uid = uid;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.country = country || null;

    this.settings = {
      theme: THEME.DEFAULT,
      notifications: {
        push: {
          enabled: false,
          news: false,
          myPleas: {
            onCompliance: false,
            onThreshold: false,
          },
          otherPleas: {
            onLocation: false,
            onNew: false,
          },
          supportedPleas: {
            onCompliance: false,
            onThreshold: false,
          }
        },

        email: {
          enabled: false,
          news: false,
          myPleas: {
            onCompliance: false,
            onThreshold: false,
          },
          otherPleas: {
            onLocation: false,
            onNew: false,
          },
          supportedPleas: {
            onCompliance: false,
            onThreshold: false,
          }
        }
      }
    };
  }
}
