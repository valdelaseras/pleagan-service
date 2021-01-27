import { Body, ConflictException, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IPlea, IPleagan, IProduct } from 'pleagan-model';
import { Observable, of } from 'rxjs';
import { PleaService } from '../../service/plea/plea.service';
import { Plea } from '../../model/plea/plea.entity';
import { constants } from 'http2';

@Controller('plea')
export class PleaController {
  constructor(private pleaService: PleaService) {}

  @Get('all')
  getAllPleas(): Promise<Plea[]> {
    return this.pleaService.getAllPleas();
  }

  @Get(':id')
  getPleaById(@Param('id') id): Promise<Plea> {
    return this.pleaService.getPleaById(id);
  }

  @Get()
  searchPleas(@Query('query') query): Promise<Plea[]> {
    return this.pleaService.searchPleas(query);
  }

  @Post()
  async addPlea(@Body() plea: IPlea): Promise<{ id: number }> {
    const { id } = await this.pleaService.addPlea(plea);
    return { id };
  }

  @Post(':id/support')
  async supportPlea(@Param('id') id, @Body() pleagan: IPleagan): Promise<void> {
    await this.pleaService.supportPlea(id, pleagan);
    return;
  }

  @Post(':id/vegan-product')
  async addVeganProduct(@Param('id') id, @Body() product: IProduct): Promise<void> {
    await this.pleaService.addVeganProduct(id, product);
    return;
  }
}
