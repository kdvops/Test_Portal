import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SeoPageResolver } from './seoPage.resolver';
import { SeoPageService } from './seoPage.service';
import { SeoPage } from './schema/seoPage.schema';

describe('SeoPageResolver', () => {
  let resolver: SeoPageResolver;
  let service: jest.Mocked<SeoPageService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<SeoPageService> = {
      updateSeoPage: jest.fn(),
      removeSeoPage: jest.fn(),
      createSeoPage: jest.fn(),
      createSeoPages: jest.fn(),
      seoPages: jest.fn(),
      findSeoPageById: jest.fn(),
      findSeoPageByPath: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoPageResolver,
        { provide: SeoPageService, useValue: serviceMock },
        { provide: getModelToken(SeoPage.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<SeoPageResolver>(SeoPageResolver);
    service = module.get(SeoPageService) as jest.Mocked<SeoPageService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      path: '/home',
      meta: { title: 'Home', description: 'Desc', image: '' },
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      _id: new Types.ObjectId(),
      path: '/home',
      meta: { title: 'Home', description: 'Desc', image: '' },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeSeoPage', async () => {
      await expect(resolver.removeSeoPage('not-an-id')).rejects.toThrow(
        'Invalid seoPageID',
      );
      expect(service.removeSeoPage).not.toHaveBeenCalled();
    });

    it('rejects findSeoPageById', () => {
      expect(() => resolver.findSeoPageById('not-an-id')).toThrow(
        'Invalid seoPageID',
      );
      expect(service.findSeoPageById).not.toHaveBeenCalled();
    });
  });

  describe('createSeoPage', () => {
    it('delegates with valid payload', async () => {
      service.createSeoPage.mockResolvedValueOnce({} as any);

      await resolver.createSeoPage(makeCreateDto());

      expect(service.createSeoPage).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/home' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createSeoPage(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createSeoPage).not.toHaveBeenCalled();
    });
  });

  describe('createSeoPages', () => {
    it('delegates with valid payload', async () => {
      service.createSeoPages.mockResolvedValueOnce(undefined);

      await resolver.createSeoPages({
        pages: [makeCreateDto()],
      } as any);

      expect(service.createSeoPages).toHaveBeenCalledWith(
        expect.objectContaining({ pages: expect.any(Array) }),
      );
    });

    it('rejects non-array pages', async () => {
      await expect(
        resolver.createSeoPages({ pages: null } as any),
      ).rejects.toThrow(BadRequestException);
      expect(service.createSeoPages).not.toHaveBeenCalled();
    });
  });

  describe('updateSeoPage', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateSeoPage.mockResolvedValueOnce({} as any);

      await resolver.updateSeoPage(dto);

      expect(service.updateSeoPage).toHaveBeenCalledWith(
        expect.objectContaining({ _id: dto._id }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateSeoPage(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateSeoPage).not.toHaveBeenCalled();
    });
  });

  describe('findSeoPageByPath', () => {
    it('rejects missing path', () => {
      expect(() => resolver.findSeoPageByPath('')).toThrow(
        BadRequestException,
      );
      expect(service.findSeoPageByPath).not.toHaveBeenCalled();
    });

    it('delegates with valid path', async () => {
      service.findSeoPageByPath.mockResolvedValueOnce({} as any);

      await resolver.findSeoPageByPath('/home');

      expect(service.findSeoPageByPath).toHaveBeenCalledWith('/home');
    });
  });
});
