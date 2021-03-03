import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { Support } from '../../model/plea/support.entity';
import { PersistenceService } from '../persistence/persistence.service';
import { IComment } from '../../model/plea/comment.interface';
import { PleaService } from '../plea/plea.service';
import { PleaganService } from '../pleagan/pleagan.service';

@Injectable()
export class SupportService {
    private __supportRepository__: Repository<Support>;

    constructor(
        private persistenceService: PersistenceService,
        private pleaService: PleaService,
        private pleaganService: PleaganService
    ) {
        this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
    }

    // @TODO: use queryBuilder
    // @TODO: re-enable later?
    // async getSupportsByPleagan( uid: string ): Promise<Support[]> {
    //     return await this.__supportRepository__.find({
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

    async addSupport( id: number, { comment }: IComment, pleaganUid: string): Promise<void> {
        const plea = await this.pleaService.getPleaById( id );

        if ( pleaganUid === plea.pleagan.uid ) {
            throw new BadRequestException(`You can't support a plea you initiated.`);
        }

        const pleagan = await this.pleaganService.getPleaganByUid( pleaganUid );
        const support = await this.__supportRepository__.save( new Support( comment ) );

        try {
            await Promise.all([
                this.__supportRepository__
                    .createQueryBuilder( 'support' )
                    .relation( Support, 'plea' )
                    .of( support )
                    .set( plea ),
                this.__supportRepository__
                    .createQueryBuilder( 'support' )
                    .relation( Support, 'pleagan' )
                    .of( support )
                    .set( pleagan ),
            ]);
        } catch (e) {
            console.log(e);
            if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
                throw new ConflictException(`You have already supported this plea.`);
            }
        }
    }

    private initialiseRepository = (): void => {
        this.__supportRepository__ = getRepository(Support);
    };
}
