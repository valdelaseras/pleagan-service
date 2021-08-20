import { Test, TestingModule } from '@nestjs/testing';
import { PleaService } from './plea.service';

describe('PleaService', () => {
  let service: PleaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PleaService],
    }).compile();

    service = module.get<PleaService>(PleaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
