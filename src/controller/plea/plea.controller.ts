import { Body, ConflictException, Controller, Get, Param, Post } from '@nestjs/common';
import { IPlea, IPleagan, IProduct } from 'pleagan-model';
import { Observable, of } from 'rxjs';
import { PleaService } from '../../service/plea/plea.service';
import { Plea } from '../../model/plea/plea.entity';

@Controller('plea')
export class PleaController {
  constructor(private pleaService: PleaService) {}

  @Get('all')
  getAllPleas(): Promise<Plea[]> {
    return this.pleaService.getAllPleas();
  }

  @Get(':id')
  getPleaById(@Param() params): Promise<Plea> {
    return this.pleaService.getPleaById(params.id);
  }

  @Post()
  addPlea(@Body() plea: IPlea): Promise<Plea> {
    return this.pleaService.addPlea(plea);
  }

  @Post(':id/support')
  supportPlea(@Param() params, @Body() pleagan: IPleagan): Promise<Plea> {
    return this.pleaService.supportPlea(params.id, pleagan);
  }

  @Post(':id/vegan-product')
  addVeganProduct(@Param() params, @Body() product: IProduct): Promise<Plea> {
    return this.pleaService.addVeganProduct(params.id, product);
  }
}
