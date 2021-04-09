import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { ISupport } from 'pleagan-model/dist/model/plea/base/support.interface';
import { Request } from 'express';
import { SupportService } from '../../service/support/support.service';
import { Support } from '../../model/plea/support.entity';

@Controller('support')
export class SupportController {

    constructor(private supportService: SupportService) {}

    @Get( ':id' )
    async getSupport(
        @Param('id') id,
    ): Promise<Support> {
        return await this.supportService.getSupportById( id );
    }

    @Put( ':id' )
    async updateSupport(
        @Param('id') id,
        @Body() support: ISupport,
        @Req() request: Request
    ): Promise<void> {
        await this.supportService.updateSupport( id, support, request[ 'firebaseUser' ].uid );
    }
}
