import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn
} from 'typeorm';
import { ISupport } from 'pleagan-model/dist/model/plea/base/support.interfase';
import { Pleagan } from '../pleagan';
import { Plea } from './plea.entity';

@Entity()
@Unique(['supporter', 'plea'])
export class Support implements ISupport {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column('text')
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne((type) => Pleagan, (pleagan) => pleagan.supports, {
        eager: true
    })
    supporter: Pleagan;

    @ManyToOne((type) => Plea, ( plea ) => plea.supports)
    plea: Plea;

    constructor( comment: string ) {
        this.comment = comment;
    }
}
