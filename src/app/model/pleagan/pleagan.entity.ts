import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { Plea } from '../plea';
import { Support } from '../support';
import { Device } from '../device';
import { Inbox } from '../inbox';
import { UserSettingsDto } from './user-settings.dto';

@Entity()
@Unique( 'displayName', [ 'displayName' ] )
export class Pleagan {
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

  @OneToMany((type) => Plea, (plea) => plea.pleagan, {
    eager: false
  })
  initiatedPleas?: Plea[];

  @OneToOne( () => Inbox, {
    cascade: [ 'remove' ],
    eager: false
  })
  @JoinColumn()
  inbox: Inbox;

  @OneToMany((type) => Support, (support) => support.pleagan, {
    eager: false
  })
  supports?: Support[];

  @OneToMany((type) => Device, ( device ) => device.pleagan, {
    eager: false,
    onUpdate: 'CASCADE'
  })
  devices?: Device[];

  @Column('simple-json', {
    select: false,
    default: `{"theme":0,"countryPrivate":false,"email":{"news":false,"myPleas":false,"supportedPleas":false}}`
  })
  settings: UserSettingsDto;

  constructor( uid: string, displayName: string, photoURL: string, country?: string ) {
    this.uid = uid;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.country = country;
  }
}
