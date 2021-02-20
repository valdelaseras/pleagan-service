import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { IPleagan } from 'pleagan-model';
import { PleaganService } from '../../service/pleagan/pleagan.service';
import { Request } from 'express';
import { Pleagan } from '../../model/pleagan';

@Controller('pleagan')
export class PleaganController {

    constructor( private pleaganService: PleaganService ) {}

    @Post()
    async addUser(@Body() pleagan: IPleagan): Promise<{ uid: string }> {
        const { uid } = await this.pleaganService.addPleagan( pleagan );
        return { uid };
    }

    @Get()
    async getCurrentUser(@Req() req: Request): Promise<Pleagan> {
        const { uid } = req['firebaseUser'];
        return this.pleaganService.getPleaganByUid( uid );
    }

    @Put(':uid')
    async updatePleagan(@Body() pleagan: IPleagan, @Param() { uid }): Promise<void> {
        return this.pleaganService.updatePleagan( uid, pleagan );
    }

}
