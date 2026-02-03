import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { TargetsService } from './targets.service';
import { Targets } from './schema/targets.schema';
import { SectionsService } from '../sections/sections.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { getUniqueExistingSlug, getUniqueSlug } from 'src/common/utils/slugBuilder';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';
import { StatusItem } from 'src/common/enums/status.enums';

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

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
    targetID: makeObjectId(),
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

describe('TargetsService', () => {
  let service: TargetsService;
  let targetModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    targetModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      removeSections: jest.fn(),
      cloneSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetsService,
        { provide: getModelToken(Targets.name), useValue: targetModel },
        { provide: SectionsService, useValue: sectionsMock },
        { provide: AzureBlobStorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<TargetsService>(TargetsService);
    sectionsService = module.get(SectionsService) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createTargets', () => {
    it('creates target with sections', async () => {
      targetModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createTargets(makeCreateDto());

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = targetModel.create.mock.calls[0][0];
      expect(payload.sections).toHaveLength(1);
    });
  });

  describe('updateTarget', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.target.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      targetModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      targetModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.targetID,
      });

      await service.updateTarget(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneTarget', () => {
    it('clones target sections into draft copy', async () => {
      const targetID = makeObjectId();
      const existingTarget = {
        _id: targetID,
        name: 'Target',
        sections: [{ _id: makeObjectId() }],
      };
      jest
        .spyOn(service, 'findTargetById')
        .mockResolvedValueOnce(existingTarget as any);
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      targetModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneTarget(targetID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = targetModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Target (copia)');
      expect(payload.slug).toBe('unique-slug');
      expect(payload.status).toBe('draft');
    });
  });

  describe('findAllTargets', () => {
    it('returns list of targets', async () => {
      targetModel.find.mockReturnValueOnce(makeQueryMock([]));

      await expect(service.findAllTargets(false)).resolves.toEqual([]);
    });
  });

  describe('findTargetById', () => {
    it('returns target by id', async () => {
      const targetID = makeObjectId();
      targetModel.findById.mockReturnValueOnce(
        makeQueryMock({ _id: targetID }),
      );

      await expect(service.findTargetById(targetID)).resolves.toEqual({
        _id: targetID,
      });
    });
  });

  describe('findTargetBySlug', () => {
    it('returns target by slug', async () => {
      targetModel.findOne.mockReturnValueOnce(
        makeQueryMock({ slug: 'target' }),
      );

      await expect(service.findTargetBySlug('target')).resolves.toEqual({
        slug: 'target',
      });
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
