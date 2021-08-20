import { Controller, ForbiddenException, Get, Param, Req } from '@nestjs/common';
import { Inbox } from '../../../../model/inbox';
import { Request } from 'express';
import { InboxService } from '../../service/inbox/inbox.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetInboxDto } from '../../../../model/inbox/get-inbox.dto';

@ApiTags( 'inbox' )
@Controller('inbox')
export class InboxController {
    constructor( private inboxService: InboxService ) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get inbox for the current user.' })
    @ApiResponse({
        status: 200,
        description: 'Success.' ,
        type: GetInboxDto
    })
    @Get('/')
    async getInbox( @Req() request: Request ): Promise<Inbox> {
        return this.inboxService.getInboxForPleagan( request[ 'firebaseUser' ].uid );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a message as opened.' })
    @ApiResponse({
        status: 200,
        description: 'Success.'
    })
    @ApiResponse({
        status: 403,
        description: 'You are not allowed to open someone else\'s messages.'
    })
    @Get( '/message/:id/opened' )
    async markMessageAsRead(
        @Param('id') id: number,
        @Req() request: Request
    ): Promise<void> {
        const ownerUid = await this.inboxService.getOwnerUidOfMessage( id );

        if ( ownerUid !== request[ 'firebaseUser' ].uid ) {
            throw new ForbiddenException( 'You are not allowed to open someone else\'s messages.' );
        }

        await this.inboxService.markMessageAsRead( id );
    }
}
