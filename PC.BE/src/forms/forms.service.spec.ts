import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { FormsService } from './forms.service';
import { Forms } from './schema/forms.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { TypeForms } from 'src/common/enums/forms.enum';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
  exec: jest.fn().mockResolvedValue(value),
});

const makeInput = (overrides: Record<string, any> = {}) => ({
  name: 'Field',
  label: 'Label',
  icon: 'icon',
  placeholder: 'placeholder',
  type: TypeForms.formText,
  radios: [],
  selects: [],
  checkbox: [],
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, any> = {}) =>
  ({
    title: 'Title',
    subtitle: 'Subtitle',
    slug: 'slug',
    crm: { url: 'https://example.com', isFormCrm: true },
    description: 'Description',
    banner: [],
    responsive: [],
    bannerImageDetail: null,
    responsiveImageDetail: null,
    inputs: [makeInput()],
    termsAndCondition: { text: 'Terms', enabled: true, accept: true },
    status: StatusItem.draft,
    disabled: false,
    ...overrides,
  }) as any;

const makeUpdateDto = (overrides: Record<string, any> = {}) =>
  ({
    formsID: makeObjectId(),
    forms: {
      title: 'Title',
      subtitle: 'Subtitle',
      slug: 'slug',
      crm: { url: 'https://example.com', isFormCrm: true },
      description: 'Description',
      banner: null,
      responsive: null,
      bannerImageDetail: null,
      responsiveImageDetail: null,
      inputs: [makeInput()],
      termsAndCondition: { text: 'Terms', enabled: true, accept: true },
      status: StatusItem.draft,
      disabled: false,
    },
    newUploadBanner: [],
    newUploadResponsive: [],
    ...overrides,
  }) as any;

describe('FormsService', () => {
  let service: FormsService;
  let formsModel: any;

  beforeEach(async () => {
    formsModel = {
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
    };

    const azureMock: jest.Mocked<AzureBlobStorageService> = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        { provide: getModelToken(Forms.name), useValue: formsModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
    jest.clearAllMocks();
  });

  describe('createForms', () => {
    it('creates a form with image details and inputs', async () => {
      const dto = makeCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'responsive' });
      formsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createForms(dto);

      const payload = formsModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
      expect(payload.inputs).toHaveLength(1);
    });
  });

  describe('updateForms', () => {
    it('updates inputs and image details', async () => {
      const dto = makeUpdateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'responsive' });
      formsModel.findOneAndUpdate.mockResolvedValueOnce({ _id: dto.formsID });

      await service.updateForms(dto);

      const payload = formsModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
      expect(payload.inputs).toHaveLength(1);
    });
  });

  describe('cloneForms', () => {
    it('clones images and inputs into a draft copy', async () => {
      const formsID = makeObjectId().toString();
      const forms = {
        _id: formsID,
        title: 'Original',
        banner: 'banner.png',
        responsive: 'responsive.png',
        inputs: [makeInput()],
      };
      jest.spyOn(service, 'findFormsById').mockResolvedValueOnce(forms as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      formsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneForms(formsID);

      const payload = formsModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findFormsById', () => {
    it('throws when form is missing', async () => {
      const formsID = makeObjectId().toString();
      formsModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findFormsById(formsID)).rejects.toThrow(
        `Form with ID ${formsID} not found`,
      );
    });

    it('returns a form', async () => {
      const formsID = makeObjectId().toString();
      formsModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: formsID }),
      );

      await expect(service.findFormsById(formsID)).resolves.toEqual({
        _id: formsID,
      });
    });
  });

  describe('findFormsBySlug', () => {
    it('throws when slug is missing', async () => {
      formsModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findFormsBySlug('missing')).rejects.toThrow(
        'Form with slug missing not found',
      );
    });
  });

  describe('findForms', () => {
    it('returns list of forms', async () => {
      formsModel.find.mockResolvedValueOnce([]);

      await service.findForms();

      expect(formsModel.find).toHaveBeenCalledWith({ deletedAt: null });
    });
  });

  describe('changeFormsStatus', () => {
    it('updates status field', async () => {
      const formsID = makeObjectId().toString();
      formsModel.findOneAndUpdate.mockResolvedValueOnce({ _id: formsID });

      await service.changeFormsStatus(formsID, 'publish');

      expect(formsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: formsID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeForms', () => {
    it('soft deletes form', async () => {
      const formsID = makeObjectId().toString();
      formsModel.findOneAndUpdate.mockResolvedValueOnce({ _id: formsID });

      await service.removeForms(formsID);

      const payload = formsModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
