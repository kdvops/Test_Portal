import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';

describe('SearchResolver', () => {
  let resolver: SearchResolver;
  let service: jest.Mocked<SearchService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<SearchService> = {
      search: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchResolver,
        { provide: SearchService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<SearchResolver>(SearchResolver);
    service = module.get(SearchService) as jest.Mocked<SearchService>;
  });

  it('rejects missing search term', () => {
    expect(() => resolver.search(undefined as any)).toThrow(
      new BadRequestException('Search is required'),
    );
    expect(service.search).not.toHaveBeenCalled();
  });

  it('rejects empty search term', () => {
    expect(() => resolver.search('  ')).toThrow(
      new BadRequestException('Search is required'),
    );
    expect(service.search).not.toHaveBeenCalled();
  });

  it('delegates with valid search term', async () => {
    service.search.mockResolvedValueOnce([]);

    await resolver.search('hello');

    expect(service.search).toHaveBeenCalledWith('hello');
  });
});
