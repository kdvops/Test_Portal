import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TargetsResolver } from './targets.resolver';
import { TargetsService } from './targets.service';
import { Targets } from './schema/targets.schema';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';
import { StatusItem } from 'src/common/enums/status.enums';

describe('TargetsResolver', () => {
  let resolver: TargetsResolver;
  let service: jest.Mocked<TargetsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<TargetsService> = {
      updateTarget: jest.fn(),
      createTargets: jest.fn(),
      cloneTarget: jest.fn(),
      changeTargetStatus: jest.fn(),
      removeTarget: jest.fn(),
      findAllTargets: jest.fn(),
      findTargetById: jest.fn(),
      findTargetBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetsResolver,
        { provide: TargetsService, useValue: serviceMock },
        { provide: getModelToken(Targets.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<TargetsResolver>(TargetsResolver);
    service = module.get(TargetsService) as jest.Mocked<TargetsService>;
  });

  const makeSectionInput = (overrides: Record<string, any> = {}) => ({
    name: 'Section',
    description: 'Desc',
    color: '',
    position: 1,
    type: 'sectionCards',
    cards: [],
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      status: StatusItem.draft,
      name: 'Target',
      icon: 'mdi-home',
      color: '#000',
      featured: GlobalPositionsFreatured.menu,
      description: 'Desc',
      slug: 'target',
      showPosts: false,
      showCategories: false,
      disabled: false,
      sections: [makeSectionInput()],
      relatedTargets: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      targetID: new Types.ObjectId().toString(),
      target: {
        status: StatusItem.draft,
        name: 'Target',
        icon: 'mdi-home',
        color: '#000',
        featured: GlobalPositionsFreatured.menu,
        description: 'Desc',
        slug: 'target',
        showPosts: false,
        showCategories: false,
        disabled: false,
        sections: [makeSectionInput()],
        relatedTargets: [],
      },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeTarget', () => {
      expect(() => resolver.removeTarget('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.removeTarget).not.toHaveBeenCalled();
    });

    it('rejects cloneTarget', () => {
      expect(() => resolver.cloneTarget('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.cloneTarget).not.toHaveBeenCalled();
    });

    it('rejects publishTarget', () => {
      expect(() => resolver.publishTarget('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.changeTargetStatus).not.toHaveBeenCalled();
    });

    it('rejects draftTarget', () => {
      expect(() => resolver.draftTarget('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.changeTargetStatus).not.toHaveBeenCalled();
    });

    it('rejects findTargetById', () => {
      expect(() => resolver.findTargetById('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.findTargetById).not.toHaveBeenCalled();
    });
  });

  describe('createTarget', () => {
    it('normalizes missing sections', async () => {
      service.createTargets.mockResolvedValueOnce({} as any);

      await resolver.createTarget(makeCreateDto({ sections: undefined }));

      expect(service.createTargets).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createTargets.mockResolvedValueOnce({} as any);

      await resolver.createTarget(makeCreateDto());

      expect(service.createTargets).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Target' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createTarget(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createTargets).not.toHaveBeenCalled();
    });

    it('rejects invalid enums', async () => {
      await expect(
        resolver.createTarget(
          makeCreateDto({ status: 'bad', featured: 'bad' }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.createTargets).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createTarget(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createTargets).not.toHaveBeenCalled();
    });
  });

  describe('updateTarget', () => {
    it('normalizes missing sections', async () => {
      const dto = makeUpdateDto({
        target: { ...makeUpdateDto().target, sections: undefined },
      });
      service.updateTarget.mockResolvedValueOnce({} as any);

      await resolver.updateTarget(dto);

      expect(service.updateTarget).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ sections: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateTarget.mockResolvedValueOnce({} as any);

      await resolver.updateTarget(dto);

      expect(service.updateTarget).toHaveBeenCalledWith(dto);
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateTarget(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateTarget).not.toHaveBeenCalled();
    });

    it('rejects invalid enums', async () => {
      await expect(
        resolver.updateTarget(
          makeUpdateDto({
            target: { ...makeUpdateDto().target, featured: 'bad' },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateTarget).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.updateTarget(
          makeUpdateDto({
            target: { ...makeUpdateDto().target, sections: null },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateTarget).not.toHaveBeenCalled();
    });
  });
});
