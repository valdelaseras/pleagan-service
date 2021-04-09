import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { IPlea } from 'pleagan-model';
import { PleaService } from '../../service/plea/plea.service';
import { Plea } from '../../model/plea';
import { Request } from 'express';
import { IComment } from '../../model/plea/comment.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportService } from '../../service/support/support.service';

@Controller('plea')
export class PleaController {
  constructor(
      private pleaService: PleaService,
      private supportService: SupportService
  ) {}

  @Get('all')
  getAllPleas( @Req() request: Request ): Promise<Plea[]> {
    return this.pleaService.getAllPleas( request[ 'firebaseUser' ]?.uid );
  }

  @Get('my-pleas')
  getPleasFromCurrentUser( @Req() request: Request ): Promise<Plea[]> {
    return this.pleaService.getPleasFromCurrentUser( request[ 'firebaseUser' ].uid );
  }

  @Get('my-supported-pleas')
  getSupportedPleasByPleagan( @Req() request: Request ): Promise<Plea[]> {
    return this.pleaService.getSupportedPleasByPleagan( request[ 'firebaseUser' ].uid );
  }

  @Get(':id')
  getPleaById( @Param('id') id ): Promise<Plea> {
    return this.pleaService.getPleaById( id );
  }

  @Get()
  searchPleas( @Query('query') query ): Promise<Plea[]> {
    return this.pleaService.searchPleas( query );
  }

  @Post()
  @UseInterceptors(FileInterceptor( 'productImage' ))
  async addPlea(
      @Body() plea: IPlea,
      @Req() request: Request,
  ): Promise<{ id: number }> {
    const { id } = await this.pleaService.addPlea( plea, request[ 'firebaseUser' ].uid );
    return { id };
  }

  @Post( ':id/support' )
  async supportPlea(
      @Param('id') id,
      @Body() comment: IComment,
      @Req() request: Request
  ): Promise<void> {
    await this.supportService.addSupport( id, comment, request[ 'firebaseUser' ].uid );
    return;
  }

  @Put( ':id' )
  async updatePlea(
      @Param('id') id,
      @Body() plea: IPlea,
      @Req() request: Request
  ): Promise<void> {
    await this.pleaService.updatePlea( id, plea, request[ 'firebaseUser' ].uid );
  }

  // @TODO: re-enable later
  // @Post(':id/vegan-product')
  // async addVeganProduct(@Param('id') id, @Body() product: IProduct): Promise<void> {
  //   await this.pleaService.addVeganProduct(id, product);
  //   return;
  // }
}
