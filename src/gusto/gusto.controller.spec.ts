import { Test, TestingModule } from '@nestjs/testing';
import { GustoController } from './gusto.controller';

describe('Gusto Controller', () => {
  let controller: GustoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GustoController],
    }).compile();

    controller = module.get<GustoController>(GustoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
