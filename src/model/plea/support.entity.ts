import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn
} from 'typeorm';
import { ISupport } from 'pleagan-model/dist/model/plea/base/support.interface';
import { Pleagan } from '../pleagan';
import { Plea } from './plea.entity';

@Entity()
@Unique(['pleagan', 'plea'])
export class Support implements ISupport {
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
