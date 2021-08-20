import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Put, Req } from '@nestjs/common';
import { SupportService } from '../../service/support/support.service';
import { UpdateSupportDto, Support } from '../../../../model/support';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { LoggerService } from '../../../shared/service/logger/logger.service';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetSupportDto } from '../../../../model/support';

@ApiTags( 'support' )
@Controller('support')
export class SupportController {

    constructor( private supportService: SupportService ) {}

    @ApiOperation({ summary: 'Get a support.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        type: () => GetSupportDto
    })
    @ApiResponse({
        status: 404,
        description: 'Support with id ${ id } could not be found.'
    })
    @Get( ':id' )
    async getSupport(
        @Param('id') id: number,
    ): Promise<Support> {
        try {
            return this.supportService.getSupportById( id );
        } catch ( exception ) {
            switch( exception.constructor ) {
                case EntityNotFoundError:
                    throw new NotFoundException(`Support with id ${id} could not be found.`);
                default:
                    LoggerService.error( exception );
            }
        }
    }

    @ApiOperation({ summary: 'Get all supports for a plea.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: () => GetSupportDto
    })
    @Get( '/plea/:pleaId' )
    async getSupportsForPlea(
        @Param('pleaId') pleaId: number,
    ): Promise<Support[]> {
        return this.supportService.getSupportsForPlea( pleaId );
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a support comment.' })
    @ApiResponse({
        status: 200,
        description: 'Success.'
    })
    @ApiResponse({
        status: 403,
        description: 'You can only update your own comments.'
    })
    @Put( ':id' )
    async updateSupport(
        @Param('id') id: number,
        @Body() support: UpdateSupportDto,
        @Req() request: Request
    ): Promise<void> {
        const results = await this.supportService.updateSupport( id, support, request[ 'firebaseUser' ].uid );
        if ( !results.affected ) {
            throw new ForbiddenException( `You can only update your own comments.` );
        }
    }
}
