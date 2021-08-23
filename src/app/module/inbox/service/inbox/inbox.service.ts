import { Injectable } from '@nestjs/common';
import { getRepository, Repository, UpdateResult } from 'typeorm';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { MessagingService } from '../../../shared/service/messaging/messaging.service';
import { Inbox, Message, Pleagan } from 'src/app/model';

@Injectable()
export class InboxService {
    private namespace = 'inbox-service';
    private inboxRepository: Repository<Inbox>;
    private messageRepository: Repository<Message>;

    constructor(
        private persistenceService: PersistenceService,
        private messagingService: MessagingService
    ) {
        this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
    }

    async createInboxForPleagan( pleagan: Pleagan ): Promise<Inbox> {
        let inbox = new Inbox();
        inbox.pleagan = pleagan;

        inbox = await this.inboxRepository.save( inbox );
        // Store the new inbox and send a welcome message
        this.messagingService.sendWelcomeMessage( pleagan, inbox );

        return inbox;
    }

    async getInboxForPleagan( uid: string ): Promise<Inbox> {
        return this.inboxRepository.createQueryBuilder( 'inbox' )
            .leftJoinAndSelect( 'inbox.messages', 'message' )
            .where( 'inbox.pleaganUid = :uid', { uid } )
            .getOne();
    }

    async getInboxForSupporters( pleaId: number ): Promise<Inbox[]> {
        return this.inboxRepository.createQueryBuilder( 'inbox' )
            .leftJoinAndSelect( 'inbox.pleagan', 'pleagan' )
            .leftJoinAndSelect( 'pleagan.supports', 'support' )
            .where( 'support.plea__id = :pleaId', { pleaId } )
            .getMany();
    }

    async getOwnerUidOfMessage( messageId: number ): Promise<string> {
        return (await this.inboxRepository.createQueryBuilder( 'inbox' )
            .leftJoin( 'inbox.messages', 'message' )
            .leftJoin( 'inbox.pleagan', 'pleagan' )
            .addSelect( 'pleagan.uid' )
            .getOneOrFail() ).pleagan.uid;
    }

    async markMessageAsRead( messageId: number ): Promise<UpdateResult> {
        return this.messageRepository.createQueryBuilder()
            .update( Message )
            .set( { opened: true } )
            .where( 'id = :id', { id: messageId } )
            .execute();
    }

    private initialiseRepository = (): void => {
        this.inboxRepository = getRepository( Inbox );
        this.messageRepository = getRepository( Message );
    };
}
