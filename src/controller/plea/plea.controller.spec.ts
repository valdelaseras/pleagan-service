import { Test, TestingModule } from '@nestjs/testing';
import { PleaController } from './plea.controller';

describe('PleaController', () => {
  let controller: PleaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PleaController],
    }).compile();

    controller = module.get<PleaController>(PleaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
