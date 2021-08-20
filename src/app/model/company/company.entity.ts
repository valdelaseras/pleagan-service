import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Plea } from '../plea';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Unique( 'name', [ 'name' ] )
export class Company {
  @ApiProperty({
    example: 1,
    description: 'Unique id of the company.',
    type: Number
  })
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty({
    example: 'Simple sense',
    description: 'Unique name of the company.',
    type: String
  })
  @Column()
  name: string;

  @ApiProperty({
    example: [ { id: 3, nonVeganProduct: { name: 'Mega meatballs' }, et: 'cetera' } ],
    description: 'Pleas made to this company.',
    type: [ Plea ]
  })
  @OneToMany( ( type ) => Plea, ( plea ) => plea.company )
  pleas?: Plea[];

  constructor( name: string ) {
    this.name = name;
  }
}
