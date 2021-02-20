import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { IPlea, IProduct } from 'pleagan-model';
import { PleaService } from '../../service/plea/plea.service';
import { Plea } from '../../model/plea';
import { Request } from 'express';

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
  async addPlea(@Body() plea: IPlea, @Req() request: Request): Promise<{ id: number }> {
    const { id } = await this.pleaService.addPlea( plea, request['firebaseUser'].uid );
    return { id };
  }

  @Post(':id/support')
  async supportPlea(@Param('id') id, @Req() request: Request): Promise<void> {
    await this.pleaService.supportPlea(id, request['firebaseUser'].uid);
    return;
  }

  @Post(':id/vegan-product')
  async addVeganProduct(@Param('id') id, @Body() product: IProduct): Promise<void> {
    await this.pleaService.addVeganProduct(id, product);
    return;
  }
}
