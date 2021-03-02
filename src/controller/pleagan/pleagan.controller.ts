import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import { IPleagan } from 'pleagan-model';
import { PleaganService } from '../../service/pleagan/pleagan.service';
import { Request } from 'express';
import * as firebase from 'firebase-admin';


@Controller('pleagan')
export class PleaganController {

    constructor( private pleaganService: PleaganService ) {}

    @Post()
    async addUser( @Req() req: Request ): Promise<void> {
        const { uid, displayName, photoURL } = (req['firebaseUser'] as firebase.auth.UserRecord);
        await this.pleaganService.createPleagan( uid, displayName, photoURL );
    }

    @Put()
    async updatePleagan( @Body() pleagan: IPleagan, @Req() req: Request ): Promise<void> {
        const { uid } = req['firebaseUser'];
        return this.pleaganService.updatePleagan( uid, pleagan );
    }
}
