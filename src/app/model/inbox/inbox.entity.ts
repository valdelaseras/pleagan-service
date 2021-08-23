import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../message/message.entity';
import { Pleagan } from '../pleagan';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Inbox {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne( () => Pleagan, {
        eager: false
    })
    @JoinColumn()
    pleagan: Pleagan;

    @OneToMany( ( type ) => Message, ( message ) => message.inbox, {
        cascade: [ 'remove' ],
        eager: true
    } )
    messages: Message[];
}
