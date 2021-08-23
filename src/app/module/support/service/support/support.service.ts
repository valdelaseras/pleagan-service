import { Injectable } from '@nestjs/common';
import { getRepository, Repository, UpdateResult } from 'typeorm';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { CreateCommentDto, Plea, Pleagan, Support } from '../../../../model';

@Injectable()
export class SupportService {
    private supportRepository: Repository<Support>;

    constructor(
        private persistenceService: PersistenceService,
    ) {
        this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
    }

    // @TODO: use queryBuilder
    // @TODO: re-enable later?
    // async getSupportsByPleagan( uid: string ): Promise<Support[]> {
    //     return await this.supportRepository.find({
    //         select: [
    //             'id',
    //             'comment',
    //             'createdAt',
    //             'updatedAt'
    //         ],
    //         relations: ['plea', 'pleagan'],
    //         where: {
    //             pleagan: {
    //                 uid
    //             }
    //         }
    //     });
    // }

    async getSupportById( id: number ): Promise<Support> {
        return this.supportRepository
            .createQueryBuilder( 'support' )
            .leftJoinAndSelect( 'support.pleagan', 'pleagan' )
            .cache(true)
            .where( 'support.id = :id', { id } )
            .getOneOrFail();
    }

    async getSupportsForPlea( pleaId: number ): Promise<Support[]> {
        return this.supportRepository.createQueryBuilder( 'support' )
            .leftJoinAndSelect( 'support.pleagan', 'pleagan' )
            .leftJoin( 'support.plea', 'plea' )
            .where( 'plea.id = :pleaId', { pleaId } )
            .getMany();
    }

    async createSupport( comment: string ): Promise<Support> {
        return await this.supportRepository.save( new Support( comment ) );
    }

    async addSupport( support: Support, plea: Plea, pleagan: Pleagan ): Promise<void> {
        await Promise.all([
            this.supportRepository
                .createQueryBuilder( 'support' )
                .relation( Support, 'plea' )
                .of( support )
                .set( plea ),
            this.supportRepository
                .createQueryBuilder( 'support' )
                .relation( Support, 'pleagan' )
                .of( support )
                .set( pleagan ),
        ]);
    }

    async updateSupport( id: number, { comment }: CreateCommentDto, uid: string ): Promise<UpdateResult> {
        return this.supportRepository
            .createQueryBuilder()
            .update( Support )
            .set({ comment: comment })
            .where( 'support.id = :id AND pleagan.uid = :uid', { id, uid } )
            .execute();
    }

    private initialiseRepository = (): void => {
        this.supportRepository = getRepository(Support);
    };

    static NOTIFICATION_THRESHOLDS = [ 2, 10, 25, 50, 250, 5000, 10000 ];
}
