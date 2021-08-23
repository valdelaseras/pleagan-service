import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Inbox } from '../inbox/inbox.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Message {
    @ApiProperty({
        example: 1,
        description: 'Unique id of the message.',
        type: Number
    })
    @PrimaryGeneratedColumn()
    id?: number;

    @ApiProperty({
        example: false,
        description: 'Has the message been opened?',
        type: Boolean
    })
    @Column({ default: false })
    opened: boolean;

    @ApiProperty({
        example: 'Welcome',
        description: 'The message\'s subject.',
        type: String
    })
    @Column( 'text' )
    subject: string;

    @ApiProperty({
        example: 'Welcome to pleagan! We are happy that you have...',
        description: 'The message\'s content.',
        type: String
    })
    @Column( 'text' )
    text: string;

    @ApiProperty({
        example: 'https://pleagan.vg',
        description: 'Optional URL.',
        type: String,
        required: false
    })
    @Column( 'text', {
        nullable: true,
        default: null
    })
    url: string;

    @ManyToOne( ( type ) => Inbox, ( inbox ) => inbox.messages, {
        eager: false
    } )
    @JoinColumn()
    inbox: Inbox;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the message entity was created.',
        type: String
    })
    @CreateDateColumn()
    createdAt: string;

    @ApiProperty({
        example: '2021-07-14T09:48:55+00:00',
        description: 'Timestamp when the message entity has last been edited.',
        type: String
    })
    @UpdateDateColumn()
    updatedAt: string;

    constructor( subject: string, text: string, url: string ) {
        this.subject = subject;
        this.text = text;
        this.url = url;
    }
}
