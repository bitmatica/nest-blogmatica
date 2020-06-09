import { Test, TestingModule } from '@nestjs/testing';
import { PlaidResolver } from './plaid.resolver';

describe('PlaidResolver', () => {
  let resolver: PlaidResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaidResolver],
    }).compile();

    resolver = module.get<PlaidResolver>(PlaidResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
