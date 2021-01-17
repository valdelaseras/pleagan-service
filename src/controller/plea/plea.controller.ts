import { Controller, Get, Param } from '@nestjs/common';
import { IPlea } from 'pleagan-model';
import { Observable, of } from 'rxjs';
import { PleaService } from '../../service/plea/plea.service';

@Controller('plea')
export class PleaController {
  constructor(private pleaService: PleaService) {}
  @Get('all')
  getAllPleas(): Observable<IPlea[]> {
    return this.pleaService.getAllPleas();
  }
  @Get(':id')
  getPleaById( @Param() params ): Observable<IPlea> {
    return this.pleaService.getPleaById( params.id );
  }
}
