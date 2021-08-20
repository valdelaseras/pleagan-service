import { Injectable } from '@nestjs/common';
import { Inbox, Message, Pleagan } from '../../../../model';
import { getRepository, Repository } from 'typeorm';
import { PersistenceService } from '../persistence/persistence.service';

@Injectable()
export class MessagingService {
    private inboxRepository: Repository<Inbox>;
    private messageRepository: Repository<Message>;

    constructor( private persistenceService: PersistenceService ) {
        this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
    }

    private initialiseRepository = (): void => {
        this.messageRepository = getRepository( Message );
        this.inboxRepository = getRepository( Inbox );
    };

    private static createMessage( subject: string, text: string, url?: string ): Message {
        return new Message( subject, text, url );
    }

    async sendMessageToPleagans( pleagans: Pleagan[], subject: string, text: string, url?: string ): Promise<void> {
        // await this.sendMessageToRecipients( pleagans.map( ({uid}) => uid), subject, text, url )
        const inboxIds = (await this.getInboxesByPleaganUids( pleagans.map( ({uid}) => uid) )).map( ({id}) => id );

        // Create and insert messages
        const messages = inboxIds.map( _ => MessagingService.createMessage( subject, text, url ) );
        const messageIds = (await this.messageRepository.createQueryBuilder( 'message' )
            .insert()
            .into( Message )
            .values( messages )
            .execute()).identifiers.map( ({ id }) => id );

        // Execute raw sql to add the message(s) to the respective inboxes
        await this.inboxRepository.query( MessagingService.generateAddMessageToInboxQuery( messageIds, inboxIds ));
    }

    async getInboxesByPleaganUids( uids: string[] ): Promise<Inbox[]> {
        return this.inboxRepository.createQueryBuilder( 'inbox' )
            .leftJoin( 'inbox.pleagan', 'pleagan' )
            .where( 'pleagan.uid in (:uids)', { uids } )
            .getMany();
    }

    async getInboxByPleaganUid( uid: string ): Promise<Inbox> {
        return this.inboxRepository.createQueryBuilder( 'inbox' )
            .leftJoin( 'inbox.pleagan', 'pleagan' )
            .where( 'pleagan.uid = :uid', { uid } )
            .getOne();
    }

    async sendWelcomeMessage( pleagan: Pleagan, inbox: Inbox ): Promise<void> {
        const subject = `Welcome!`;
        const text = `Welcome to Pleagan!\n\nFrom now on you will be able to create your own pleas and supports others'.\n\nFeel free to reach out to us at xxx@xxx.xxx if you have any questions or comments.\n\nKind regards,\n\nTeam Pleagan`;
        const message = MessagingService.createMessage( subject, text );
        message.inbox = inbox;

        await this.messageRepository.save( message );
    }

    private static generateAddMessageToInboxQuery( messageIds: number[], inboxIds: number[] ): string {
        return `UPDATE message SET inboxId = ( CASE id ${ messageIds.map( ( messageId: number, index: number) => `WHEN ${ messageId } THEN ${ inboxIds[index] }`).join(' ') } END) WHERE id IN( ${ messageIds.join(',') } );`
    }
}
