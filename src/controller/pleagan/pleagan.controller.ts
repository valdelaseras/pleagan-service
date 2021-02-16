import { Body, Controller, Post } from '@nestjs/common';
import { IPleagan } from 'pleagan-model';
import { PleaganService } from '../../service/pleagan/pleagan.service';

@Controller('pleagan')
export class PleaganController {

    constructor( private pleaganService: PleaganService ) {}

    @Post()
    async addUser(@Body() pleagan: IPleagan): Promise<{ uid: string }> {
        const { uid } = await this.pleaganService.addPleagan( pleagan );
        return { uid };
    }

}
