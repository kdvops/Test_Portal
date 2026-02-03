import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';

const makeSchema = (paths: Record<string, any>) => ({
  eachPath: (cb: (path: string, type: any) => void) => {
    Object.entries(paths).forEach(([path, type]) => cb(path, type));
  },
  path: (name: string) => paths[name],
});

const makeQueryMock = <T>(value: T) => {
  const query: any = {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

describe('SearchService', () => {
  let service: SearchService;
  let connection: any;

  beforeEach(async () => {
    connection = {
      models: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('returns empty when no string fields exist', async () => {
    const schema = makeSchema({
      count: { instance: 'Number' },
    });
    const model = {
      schema,
      collection: { name: 'empty' },
      find: jest.fn(),
    };
    connection.models = { Empty: model };

    const result = await service.search('term');

    expect(result).toEqual([]);
    expect(model.find).not.toHaveBeenCalled();
  });

  it('searches string fields and maps results', async () => {
    const schema = makeSchema({
      title: { instance: 'String' },
      description: { instance: 'String' },
    });
    const docs = [
      { _id: '1', title: 'Hello', description: 'World' },
      { _id: '2', name: 'Name' },
    ];
    const model = {
      schema,
      collection: { name: 'posts' },
      find: jest.fn().mockReturnValue(makeQueryMock(docs)),
    };
    connection.models = { Posts: model };

    const result = await service.search('hello');

    expect(model.find).toHaveBeenCalledWith(
      expect.objectContaining({ $or: expect.any(Array) }),
    );
    expect(result).toEqual([
      expect.objectContaining({ _id: '1', text: 'Hello', collection: 'posts' }),
      expect.objectContaining({ _id: '2', text: 'Name', collection: 'posts' }),
    ]);
  });

  it('adds filters for deleted and draft items', async () => {
    const schema = makeSchema({
      title: { instance: 'String' },
      deletedAt: { instance: 'Date' },
      status: { instance: 'String' },
      item_status: { instance: 'String' },
    });
    const model = {
      schema,
      collection: { name: 'filtered' },
      find: jest.fn().mockReturnValue(makeQueryMock([])),
    };
    connection.models = { Filtered: model };

    await service.search('term');

    const queryArg = model.find.mock.calls[0][0];
    expect(queryArg.$and).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ deletedAt: null }),
        expect.objectContaining({ status: { $ne: 'draft' } }),
        expect.objectContaining({ item_status: { $ne: 'draft' } }),
      ]),
    );
  });

  it('populates category when schema references it', async () => {
    const schema = makeSchema({
      title: { instance: 'String' },
      category: { instance: 'ObjectId', options: { ref: 'Category' } },
    });
    const model = {
      schema,
      collection: { name: 'withCategory' },
      find: jest.fn().mockReturnValue(makeQueryMock([])),
    };
    connection.models = { WithCategory: model };

    await service.search('term');

    const query = model.find.mock.results[0].value;
    expect(query.populate).toHaveBeenCalledWith(['category']);
  });

  it('populates season when schema references it', async () => {
    const schema = makeSchema({
      title: { instance: 'String' },
      season: { instance: 'ObjectId', options: { ref: 'Season' } },
    });
    const model = {
      schema,
      collection: { name: 'withSeason' },
      find: jest.fn().mockReturnValue(makeQueryMock([])),
    };
    connection.models = { WithSeason: model };

    await service.search('term');

    const query = model.find.mock.results[0].value;
    expect(query.populate).toHaveBeenCalledWith(['season']);
  });
});
