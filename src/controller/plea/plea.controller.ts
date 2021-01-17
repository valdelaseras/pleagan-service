import { Controller, Get } from '@nestjs/common';

@Controller('plea')
export class PleaController {
    @Get()
    getPleas(): Plea[] {

    }
}
