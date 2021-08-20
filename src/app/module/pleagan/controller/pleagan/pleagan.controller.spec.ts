import { Test, TestingModule } from '@nestjs/testing';
import { PleaganController } from './pleagan.controller';

describe('PleaganController', () => {
  let controller: PleaganController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PleaganController],
    }).compile();

    controller = module.get<PleaganController>(PleaganController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
