import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { IPleagan } from 'pleagan-model';
import { PleaganService } from '../../service/pleagan/pleagan.service';
import { Request } from 'express';
import * as firebase from 'firebase-admin';
import { Pleagan } from '../../model/pleagan';


@Controller('pleagan')
export class PleaganController {

    constructor( private pleaganService: PleaganService ) {}

    @Get()
    async getCurrentUser( @Req() req: Request ): Promise<Pleagan> {
        const { uid } = req['firebaseUser'];
        return this.pleaganService.getCurrentPleagan( uid );
    }

    @Post()
    async addUser( @Req() req: Request, @Body() { country }: { country: string } ): Promise<void> {
        const { uid, displayName, photoURL } = (req['firebaseUser'] as firebase.auth.UserRecord);
        await this.pleaganService.createPleagan( uid, displayName, photoURL, country );
    }

    @Put()
    async updatePleagan( @Body() pleagan: IPleagan, @Req() req: Request ): Promise<void> {
        const { uid } = req['firebaseUser'];
        return this.pleaganService.updatePleagan( uid, pleagan );
    }
}
