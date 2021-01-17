import { Module } from '@nestjs/common';
import { PleaController } from './controller/plea/plea.controller';
import { PleaService } from './service/plea/plea.service';

@Module({
  imports: [],
  controllers: [PleaController],
  providers: [PleaService],
})
export class AppModule {}
