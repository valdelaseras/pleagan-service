import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { PleaganService } from '../../service/pleagan/pleagan.service';
import { Request } from 'express';
import { InboxService } from '../../../inbox/service/inbox/inbox.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePleaganDto, GetCurrentPleaganDto, GetPleaganDto, Pleagan, UpdatePleaganDto } from '../../../../model';

@ApiTags( 'pleagan' )
@Controller('pleagan')
export class PleaganController {

    constructor(
        private pleaganService: PleaganService,
        private inboxService: InboxService
    ) {}

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the current pleagan.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        type: () => GetCurrentPleaganDto
    })
    @Get()
    async getCurrentUser( @Req() req: Request ): Promise<Pleagan> {
        return this.pleaganService.getPleaganByUid( req['firebaseUser'].uid );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new pleagan.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        type: () => GetPleaganDto
    })
    @Post()
    async addUser(
        @Req() req: Request,
        @Body() { country }: CreatePleaganDto
    ): Promise<Pleagan> {
        const { uid, displayName, photoURL } = req['firebaseUser'];

        // Create a new pleagan entity
        const pleagan = await this.pleaganService.createPleagan( uid, displayName, photoURL, country );

        // Create and store an inbox for the pleagan entity
        // pleagan.inbox = await this.inboxService.createInboxForPleagan( pleagan );
        return this.pleaganService.savePleagan( pleagan );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update the current pleagan.' })
    @ApiResponse({
        status: 200,
        description: 'Success.'
    })
    @Put()
    async updatePleagan(
        @Body() pleagan: UpdatePleaganDto,
        @Req() req: Request
    ): Promise<void> {
        return this.pleaganService.updatePleagan( req['firebaseUser'].uid, pleagan );
    }
}
