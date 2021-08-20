import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn
} from 'typeorm';
import { Pleagan } from '../pleagan';
import { Plea } from '../plea';

@Entity()
@Unique(['pleagan', 'plea'])
export class Support {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column('text')
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne((type) => Plea, (plea) => plea.supports, {
        eager: true
    })
    @JoinColumn({
        name: 'plea__id',
        referencedColumnName: 'id'
    })
    plea: Plea;

    @ManyToOne((type) => Pleagan, (pleagan) => pleagan.supports,{
        eager: true
    })
    @JoinColumn({
        name: 'pleagan__uid',
        referencedColumnName: 'uid',
    })
    pleagan?: Pleagan;

    constructor( comment: string ) {
        this.comment = comment;
    }
}
