import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { FinanciallyService } from './financially.service';
import { Financially } from './schema/financially.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { CreateFinanciallyDto } from './dto/create.financially.dto';
import { AuthorInput } from 'src/common/types/author.type';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { ArgsFinancially } from './dto/args.financially.dto';
import { TypeSection } from 'src/common/enums/sections.enums';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makeBaseCreateDto = (): CreateFinanciallyDto =>
  ({
    title: 'Test title',
    slug: 'test-slug',
    subtitle: 'Subtitle',
    excerpt: 'Extract',
    description: 'Description',
    type: 'post::article' as TypePostFinancially,
    disabled: false,
    status: 'draft' as StatusItem,
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    file: [],
    sections: [],
    authors: [],
    altTextBanner: '',
    altTextThumbnail: '',
    altTextResponsive: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    canonicalUrl: '',
    tags: [],
    ogImage: '',
    twitterImage: '',
    socialTitle: '',
    socialDescription: '',
    altText: '',
    readingTime: 0,
    robotsDirectives: '',
    language: '',
    structuredType: '',
    focusKeyword: '',
    relatedPosts: [],
    isFeatured: false,
    schemaMarkup: '',
  }) as CreateFinanciallyDto;

const makeSectionInput = (overrides: Partial<any> = {}) => ({
  name: 'Section 1',
  description: 'Desc 1',
  color: '',
  position: 1,
  style: null,
  type: TypeSection.sectionCards,
  cards: [],
  banner: null,
  table: null,
  attachments: null,
  text: null,
  video: null,
  image: null,
  imageDetail: null,
  grids: null,
  gallery: null,
  accordion: null,
  ...overrides,
});

const makeAuthorInput = (name: string, image: string | null): AuthorInput =>
  ({
    name,
    image: image ? { image } : null,
  }) as AuthorInput;

describe('FinanciallyService', () => {
  let service: FinanciallyService;
  let financiallyModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    financiallyModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    const azureMock: jest.Mocked<AzureBlobStorageService> = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn(),
      removeSections: jest.fn(),
      cloneSections: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanciallyService,
        {
          provide: getModelToken(Financially.name),
          useValue: financiallyModel,
        },
        { provide: AzureBlobStorageService, useValue: azureMock },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<FinanciallyService>(FinanciallyService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createFinancially', () => {
    it('creates a post with required fields only', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.title).toBe(dto.title);
      expect(payload.slug).toBe(dto.slug);
      expect(payload.subtitle).toBe(dto.subtitle);
      expect(payload.excerpt).toBe(dto.excerpt);
      expect(payload.description).toBe(dto.description);
      expect(payload.type).toBe(dto.type);
      expect(payload.sections).toEqual([]);
      expect(payload.authors).toEqual([]);
    });

    it('accepts empty arrays without crashing', async () => {
      const dto = {
        title: 'Example title',
        slug: 'example-slug',
        excerpt: 'Example excerpt',
        subtitle: 'Example subtitle',
        description: 'Example description',
        type: 'postArticle',
        sections: [],
        authors: [],
        file: [],
        banner: [],
        responsive: [],
        thumbnail: [],
        disabled: false,
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        canonicalUrl: '',
        socialTitle: '',
        socialDescription: '',
        keywords: [],
        tags: [],
        ogImage: '',
        twitterImage: '',
        robotsDirectives: 'index, follow',
        language: 'es',
        structuredType: 'Article',
        altText: '',
        schemaMarkup: '',
        altTextBanner: '',
        altTextThumbnail: '',
        altTextResponsive: '',
        isFeatured: false,
        thumbnailImageDetail: {
          image: 'data:image/jpeg;base64,',
          altText: null,
        },
        responsiveImageDetail: {
          image: 'data:image/jpeg;base64,',
          altText: null,
        },
        bannerImageDetail: { image: 'data:image/jpeg;base64,', altText: null },
        status: 'publish',
      } as any;

      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await expect(service.createFinancially(dto)).resolves.toBeTruthy();
      expect(financiallyModel.create).toHaveBeenCalledTimes(1);
    });

    it('creates a post with banner image only', async () => {
      const dto = makeBaseCreateDto();
      dto.bannerImageDetail = { image: 'banner-base64' } as any;
      mockGetImageDetail
        .mockResolvedValueOnce({ banner: 'banner-detail' })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.bannerImageDetail).toEqual({ banner: 'banner-detail' });
      expect(payload.thumbnailImageDetail).toBeNull();
      expect(payload.responsiveImageDetail).toBeNull();
    });

    it('creates a post with banner and responsive images', async () => {
      const dto = makeBaseCreateDto();
      dto.bannerImageDetail = { image: 'banner-base64' } as any;
      dto.responsiveImageDetail = { image: 'responsive-base64' } as any;
      mockGetImageDetail
        .mockResolvedValueOnce({ banner: 'banner-detail' })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ responsive: 'responsive-detail' });
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.bannerImageDetail).toEqual({ banner: 'banner-detail' });
      expect(payload.responsiveImageDetail).toEqual({
        responsive: 'responsive-detail',
      });
      expect(payload.thumbnailImageDetail).toBeNull();
    });

    it('creates a post with all images', async () => {
      const dto = makeBaseCreateDto();
      dto.bannerImageDetail = { image: 'banner-base64' } as any;
      dto.thumbnailImageDetail = { image: 'thumb-base64' } as any;
      dto.responsiveImageDetail = { image: 'resp-base64' } as any;
      mockGetImageDetail
        .mockResolvedValueOnce({ banner: 'banner-detail' })
        .mockResolvedValueOnce({ thumbnail: 'thumbnail-detail' })
        .mockResolvedValueOnce({ responsive: 'responsive-detail' });
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.bannerImageDetail).toEqual({ banner: 'banner-detail' });
      expect(payload.thumbnailImageDetail).toEqual({
        thumbnail: 'thumbnail-detail',
      });
      expect(payload.responsiveImageDetail).toEqual({
        responsive: 'responsive-detail',
      });
    });

    it('creates a post with a single author', async () => {
      const dto = makeBaseCreateDto();
      dto.authors = [makeAuthorInput('Author 1', 'author-base64')];
      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ author: 'author-detail' });
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.authors).toHaveLength(1);
      expect(payload.authors[0].name).toBe('Author 1');
      expect(payload.authors[0].image).toEqual({ author: 'author-detail' });
      expect(payload.authors[0]._id).toBeInstanceOf(Types.ObjectId);
    });

    it('creates a post with multiple authors', async () => {
      const dto = makeBaseCreateDto();
      dto.authors = [
        makeAuthorInput('Author 1', 'author-1'),
        makeAuthorInput('Author 2', 'author-2'),
      ];
      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ author: 'author-1-detail' })
        .mockResolvedValueOnce({ author: 'author-2-detail' });
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.authors).toHaveLength(2);
      expect(payload.authors[0].image).toEqual({ author: 'author-1-detail' });
      expect(payload.authors[1].image).toEqual({ author: 'author-2-detail' });
    });

    it('creates a post with sections', async () => {
      const dto = makeBaseCreateDto();
      dto.sections = [makeSectionInput()];
      mockGetImageDetail.mockResolvedValue(null);
      const createdSectionId = makeObjectId();
      sectionsService.createSections.mockResolvedValueOnce({
        _id: createdSectionId,
      } as any);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload._id).toBeInstanceOf(Types.ObjectId);
      expect(payload.sections).toEqual([{ _id: createdSectionId }]);
    });

    it('creates a post using ObjectId values to avoid null creation', async () => {
      const dto = makeBaseCreateDto();
      dto.sections = [makeSectionInput()];
      dto.authors = [makeAuthorInput('Author 1', null)];

      mockGetImageDetail.mockResolvedValue(null);
      const createdSectionId = makeObjectId();
      sectionsService.createSections.mockResolvedValueOnce({
        _id: createdSectionId,
      } as any);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload._id).toBeInstanceOf(Types.ObjectId);
      expect(payload.sections[0]._id).toBeInstanceOf(Types.ObjectId);
      expect(payload.authors[0]._id).toBeInstanceOf(Types.ObjectId);
    });

    it('propagates create failures from the model', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockRejectedValueOnce(
        new Error('Cast to ObjectId failed'),
      );

      await expect(service.createFinancially(dto)).rejects.toThrow(
        'Cast to ObjectId failed',
      );
    });

    it('returns null when create resolves null', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockResolvedValueOnce(null);

      const result = await service.createFinancially(dto);

      expect(result).toBeNull();
    });

    it('defaults missing authors to an empty list', async () => {
      const dto = {
        ...makeBaseCreateDto(),
        authors: undefined,
      } as any;
      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.authors).toEqual([]);
    });

    it('rejects missing sections (should be a validation error)', async () => {
      const dto = {
        ...makeBaseCreateDto(),
        sections: undefined,
      } as any;
      mockGetImageDetail.mockResolvedValue(null);

      await expect(service.createFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects null sections (should be a validation error)', async () => {
      const dto = {
        ...makeBaseCreateDto(),
        sections: null,
      } as any;
      mockGetImageDetail.mockResolvedValue(null);

      await expect(service.createFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findUniqueSlug', () => {
    it('returns a unique slug when duplicate exists', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('duplicate-slug-1');

      const result = await service.findUniqueSlug('duplicate-slug');

      expect(mockGetUniqueExistingSlug).toHaveBeenCalledWith(
        'duplicate-slug',
        financiallyModel,
      );
      expect(result).toBe('duplicate-slug-1');
    });
  });

  describe('updateFinancially', () => {
    it('updates a post with create, update, and remove sections', async () => {
      const financiallyId = makeObjectId();
      const originalSectionId = makeObjectId();
      const keepSectionId = makeObjectId();
      const newSectionId = makeObjectId();

      const originalQuery = makeQueryMock({
        sections: [
          { _id: originalSectionId } as any,
          { _id: keepSectionId } as any,
        ],
      });
      financiallyModel.findById.mockReturnValueOnce(originalQuery);

      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: '',
          sections: [
            { _id: keepSectionId, type: TypeSection.sectionBanner } as any,
            { type: TypeSection.sectionCards, cards: [] } as any,
          ],
          authors: [],
        },
        newUploadFile: [],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      sectionsService.updateSections.mockResolvedValueOnce({
        _id: keepSectionId,
      } as any);
      sectionsService.createSections.mockResolvedValueOnce({
        _id: newSectionId,
      } as any);
      sectionsService.removeSections.mockResolvedValueOnce({
        _id: originalSectionId,
      } as any);
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
      });

      await service.updateFinancially(updateDto);

      expect(sectionsService.removeSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      expect(financiallyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: financiallyId },
        expect.objectContaining({
          sections: [{ _id: keepSectionId }, { _id: newSectionId }],
        }),
        { new: true },
      );
    });

    it('keeps existing file when newUploadFile is empty', async () => {
      const financiallyId = makeObjectId();
      financiallyModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: [] }),
      );
      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: 'existing-file',
          sections: [],
          authors: [],
        },
        newUploadFile: [],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
      });
      const uploadSpy = jest.spyOn(service as any, 'checkUploadImageFinancially');

      await service.updateFinancially(updateDto);

      const payload = financiallyModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.file).toBe('existing-file');
      expect(uploadSpy).not.toHaveBeenCalled();
    });

    it('uploads and replaces file when newUploadFile has data', async () => {
      const financiallyId = makeObjectId();
      financiallyModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: [] }),
      );
      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: 'existing-file',
          sections: [],
          authors: [],
        },
        newUploadFile: [{ file: 'data', filetype: 'pdf' }],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
      });
      jest
        .spyOn(service as any, 'checkUploadImageFinancially')
        .mockResolvedValueOnce('uploaded-file');

      await service.updateFinancially(updateDto);

      const payload = financiallyModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.file).toBe('uploaded-file');
    });

    it('rejects missing update sections (should be a validation error)', async () => {
      const financiallyId = makeObjectId();
      const originalSectionId = makeObjectId();
      financiallyModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: [{ _id: originalSectionId } as any] }),
      );

      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: '',
          sections: undefined,
          authors: [],
        },
        newUploadFile: [],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.updateFinancially(updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('defaults missing update authors to an empty list', async () => {
      const financiallyId = makeObjectId();
      const originalSectionId = makeObjectId();
      financiallyModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: [{ _id: originalSectionId } as any] }),
      );

      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: '',
          sections: [],
          authors: undefined,
        },
        newUploadFile: [],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      sectionsService.updateSections.mockResolvedValueOnce({
        _id: originalSectionId,
      } as any);
      sectionsService.removeSections.mockResolvedValueOnce({
        _id: originalSectionId,
      } as any);
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
      });

      await service.updateFinancially(updateDto);

      const updatePayload = financiallyModel.findOneAndUpdate.mock.calls[0][1];
      expect(updatePayload.authors).toEqual([]);
    });

    it('rejects null update sections (should be a validation error)', async () => {
      const financiallyId = makeObjectId();
      const originalSectionId = makeObjectId();
      financiallyModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: [{ _id: originalSectionId } as any] }),
      );

      const updateDto = {
        financiallyID: financiallyId,
        financially: {
          title: 'Updated',
          slug: 'updated',
          type: 'post::article',
          banner: null,
          thumbnail: null,
          responsive: null,
          bannerImageDetail: null,
          thumbnailImageDetail: null,
          responsiveImageDetail: null,
          file: '',
          sections: null,
          authors: [],
        },
        newUploadFile: [],
      } as any;

      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.updateFinancially(updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cloneFinancially', () => {
    it('clones a post and defaults missing authors', async () => {
      const financiallyId = makeObjectId();
      const sectionA = { _id: makeObjectId() } as any;
      const sectionB = { _id: makeObjectId() } as any;
      const financially = {
        _id: financiallyId,
        title: 'Post',
        banner: 'banner-url',
        thumbnail: null,
        responsive: null,
        file: null,
        bannerImageDetail: null,
        responsiveImageDetail: null,
        thumbnailImageDetail: null,
        sections: [sectionA, sectionB],
        authors: undefined,
      } as any;

      financiallyModel.findOne.mockReturnValueOnce(makeQueryMock(financially));
      sectionsService.cloneSections.mockResolvedValueOnce({
        _id: sectionA._id,
      } as any);
      sectionsService.cloneSections.mockResolvedValueOnce({
        _id: sectionB._id,
      } as any);
      mockCloneFiles.mockResolvedValue('cloned-banner');
      mockGetUniqueSlug.mockResolvedValueOnce('cloned-slug');
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneFinancially(financiallyId);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.authors).toEqual([]);
      expect(payload.sections).toEqual([
        { _id: sectionA._id },
        { _id: sectionB._id },
      ]);
      expect(payload.slug).toBe('cloned-slug');
    });

    it('throws when cloned post is missing sections', async () => {
      const financiallyId = makeObjectId();
      const financially = {
        _id: financiallyId,
        title: 'Post',
        banner: 'banner-url',
        thumbnail: null,
        responsive: null,
        file: null,
        bannerImageDetail: null,
        responsiveImageDetail: null,
        thumbnailImageDetail: null,
        sections: undefined,
        authors: [],
      } as any;

      financiallyModel.findOne.mockReturnValueOnce(makeQueryMock(financially));

      await expect(service.cloneFinancially(financiallyId)).rejects.toThrow(
        "Cannot read properties of undefined (reading 'map')",
      );
    });
  });

  describe('removeFinancially', () => {
    it('soft deletes a post', async () => {
      const financiallyId = makeObjectId();
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
        deletedAt: new Date(),
      });

      await service.removeFinancially(financiallyId);

      expect(financiallyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: financiallyId },
        { $set: { deletedAt: expect.any(Date) } },
        { new: true },
      );
    });

    it('passes ObjectId through to the model', async () => {
      const financiallyId = makeObjectId();
      financiallyModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: financiallyId,
        deletedAt: new Date(),
      });

      await service.removeFinancially(financiallyId);

      const callId = financiallyModel.findOneAndUpdate.mock.calls[0][0]._id;
      expect(callId).toBeInstanceOf(Types.ObjectId);
    });
  });

  describe('findFinancially', () => {
    it('returns all posts when requested', async () => {
      const args: ArgsFinancially = {
        page: 1,
        itemsPerPage: 5,
        search: 'post',
        type: 'post::article',
      };
      financiallyModel.aggregate.mockResolvedValueOnce([
        { _id: makeObjectId(), title: 'Post 1' },
      ]);

      const result = await service.findFinancially(args, true);

      expect(financiallyModel.aggregate).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Post 1');
    });

    it('rejects missing args (should be a validation error)', async () => {
      await expect(
        service.findFinancially(undefined as any, true),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findFinanciallyPaginated', () => {
    it('returns paginated posts', async () => {
      const args: ArgsFinancially = {
        page: 1,
        itemsPerPage: 5,
        search: '',
        type: '',
      };

      financiallyModel.aggregate.mockResolvedValueOnce([
        { items: [{ _id: makeObjectId() }], totalItems: 1 },
      ]);

      const result = await service.findFinanciallyPaginated(args);

      expect(financiallyModel.aggregate).toHaveBeenCalledTimes(1);
      expect(result.items).toHaveLength(1);
      expect(result.totalItems).toBe(1);
    });

    it('clamps pagination inputs and returns empty when no rows exist', async () => {
      financiallyModel.aggregate.mockResolvedValueOnce([]);

      const result = await service.findFinanciallyPaginated({
        page: -1,
        itemsPerPage: 999,
        search: '',
        type: '',
      } as ArgsFinancially);

      const pipeline = financiallyModel.aggregate.mock.calls[0][0];
      expect(pipeline[2].$facet.items[0].$skip).toBe(0);
      expect(pipeline[2].$facet.items[1].$limit).toBe(100);
      expect(result.items).toEqual([]);
      expect(result.totalItems).toBe(0);
    });

    it('rejects missing args (should be a validation error)', async () => {
      await expect(
        service.findFinanciallyPaginated(undefined as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFinanciallyRelated', () => {
    it('returns empty related list when base post is missing', async () => {
      const financiallyId = makeObjectId();
      const baseQuery = makeQueryMock(null);
      financiallyModel.findById.mockReturnValueOnce(baseQuery);

      const result = await service.getFinanciallyRelated(financiallyId);

      expect(result).toEqual([]);
      expect(financiallyModel.find).not.toHaveBeenCalled();
    });
  });

  describe('createFinancially edge cases', () => {
    it('skips file upload when file data is missing', async () => {
      const dto = makeBaseCreateDto();
      dto.file = [{ file: '', filetype: '' }] as any;
      mockGetImageDetail.mockResolvedValue(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const uploadSpy = jest.spyOn(
        service as any,
        'checkUploadImageFinancially',
      );

      await service.createFinancially(dto);

      expect(uploadSpy).not.toHaveBeenCalled();
    });

    it('accepts an author without image', async () => {
      const dto = makeBaseCreateDto();
      dto.authors = [makeAuthorInput('Author 1', null)];
      mockGetImageDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      financiallyModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createFinancially(dto);

      const payload = financiallyModel.create.mock.calls[0][0];
      expect(payload.authors[0].image).toBeNull();
    });
  });

  describe('findFinanciallyById', () => {
    it('returns a single post by id', async () => {
      const financiallyId = makeObjectId();
      const query = makeQueryMock({ _id: financiallyId });
      financiallyModel.findOne.mockReturnValueOnce(query);

      const result = await service.findFinanciallyById(financiallyId);

      expect(result._id).toEqual(financiallyId);
    });

    it('throws when post id is not found', async () => {
      const financiallyId = makeObjectId();
      const query = makeQueryMock(null);
      financiallyModel.findOne.mockReturnValueOnce(query);

      await expect(service.findFinanciallyById(financiallyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
