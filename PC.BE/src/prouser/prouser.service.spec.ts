import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { of, throwError } from 'rxjs';

import { ProuserService } from './prouser.service';
import { Prouser } from './schema/prouser.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { HttpService } from '@nestjs/axios';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { ASContainerName } from 'src/common/constants';

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

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
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

const makeBaseCreateDto = () =>
  ({
    title: 'Title',
    subtitle: 'Subtitle',
    link: '',
    slug: 'slug',
    excerpt: 'Excerpt',
    description: 'Description',
    category: makeObjectId().toString(),
    banner: null,
    thumbnail: null,
    responsive: null,
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    status: StatusItem.draft,
    disabled: false,
    sections: [makeSectionInput()],
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    prouserID: makeObjectId(),
    prouser: {
      title: 'Title',
      excerpt: 'Excerpt',
      slug: 'slug',
      subtitle: 'Subtitle',
      link: '',
      description: 'Description',
      category: makeObjectId().toString(),
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      status: StatusItem.draft,
      disabled: false,
      sections: [makeSectionInput()],
    },
    newUploadBanner: [],
    newUploadThumbnail: [],
    newUploadResponsive: [],
  }) as any;

describe('ProuserService', () => {
  let service: ProuserService;
  let prouserModel: any;
  let sectionsService: jest.Mocked<SectionsService>;
  let azureService: jest.Mocked<AzureBlobStorageService>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    prouserModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      removeSections: jest.fn(),
      cloneSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
    } as any;

    httpService = {
      post: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProuserService,
        { provide: getModelToken(Prouser.name), useValue: prouserModel },
        { provide: AzureBlobStorageService, useValue: azureService },
        { provide: SectionsService, useValue: sectionsMock },
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<ProuserService>(ProuserService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createProuser', () => {
    it('creates a prouser with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      prouserModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createProuser(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = prouserModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      prouserModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createProuser(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = prouserModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateProuser', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.prouser.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      prouserModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      prouserModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.prouserID,
      });

      await service.updateProuser(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneProuser', () => {
    it('clones images and sections into a draft copy', async () => {
      const prouserID = makeObjectId();
      const existingProuser = {
        _id: prouserID,
        title: 'Original',
        banner: 'banner.png',
        responsive: 'responsive.png',
        thumbnail: 'thumbnail.png',
        bannerImageDetail: { image: 'b.png' },
        responsiveImageDetail: { image: 'r.png' },
        thumbnailImageDetail: { image: 't.png' },
        sections: [{ _id: makeObjectId() }],
      };
      jest
        .spyOn(service, 'findProuserById')
        .mockResolvedValueOnce(existingProuser as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      prouserModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneProuser(prouserID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = prouserModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findProuserById', () => {
    it('throws when prouser is missing', async () => {
      const prouserID = makeObjectId();
      prouserModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findProuserById(prouserID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a prouser', async () => {
      const prouserID = makeObjectId();
      prouserModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: prouserID }),
      );

      await expect(service.findProuserById(prouserID)).resolves.toEqual({
        _id: prouserID,
      });
    });
  });

  describe('findProuserGroupByType', () => {
    it('aggregates prouser by category', async () => {
      prouserModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findProuserGroupByType(false);

      expect(prouserModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findProuser', () => {
    it('builds a search pipeline', async () => {
      prouserModel.aggregate.mockReturnValueOnce([]);

      await service.findProuser({ search: 'title', category: 'cat' });

      expect(prouserModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findProuserByCategory', () => {
    it('returns by category', async () => {
      prouserModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findProuserByCategory('category', false);

      expect(prouserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeProuserStatus', () => {
    it('updates status field', async () => {
      const prouserID = makeObjectId();
      prouserModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: prouserID,
      });

      await service.changeProuserStatus(prouserID, 'publish');

      expect(prouserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: prouserID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeProuser', () => {
    it('soft deletes prouser', async () => {
      const prouserID = makeObjectId();
      prouserModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: prouserID,
      });

      await service.removeProuser(prouserID);

      const payload = prouserModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeFiles', () => {
    it('removes image detail when present', async () => {
      const prouserID = makeObjectId();
      const imageUrl = `${ASContainerName}prouser/banner.png`;
      prouserModel.findById.mockReturnValueOnce(
        makeQueryMock({ bannerImageDetail: { image: imageUrl } }),
      );

      await service.removeFiles(prouserID, 'bannerImageDetail');

      expect(azureService.remove).toHaveBeenCalledWith([{ Key: imageUrl }]);
    });

    it('skips removal when missing file', async () => {
      const prouserID = makeObjectId();
      prouserModel.findById.mockReturnValueOnce(makeQueryMock({}));

      await service.removeFiles(prouserID, 'bannerImageDetail');

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });

  describe('findProuserValidationDocument', () => {
    it('returns document data when service responds', async () => {
      const soapResponse =
        '<s:Envelope><s:Body><ExecuteResponse><ExecuteResult><![CDATA[' +
        '<ExtremeMsgReply><Data><DField/><DField/><DField Value="[{&quot;NOMBRE&quot;:&quot;Test&quot;}]"/></Data></ExtremeMsgReply>' +
        ']]></ExecuteResult></ExecuteResponse></s:Body></s:Envelope>';
      httpService.post.mockReturnValueOnce(of({ data: soapResponse } as any));

      await expect(
        service.findProuserValidationDocument('123'),
      ).resolves.toEqual({ NOMBRE: 'Test' });
    });

    it('throws when validation document is missing', async () => {
      const soapResponse =
        '<s:Envelope><s:Body><ExecuteResponse><ExecuteResult><![CDATA[' +
        '<ExtremeMsgReply><Data><DField/><DField/><DField Value="[]"/></Data></ExtremeMsgReply>' +
        ']]></ExecuteResult></ExecuteResponse></s:Body></s:Envelope>';
      httpService.post.mockReturnValueOnce(of({ data: soapResponse } as any));

      await expect(
        service.findProuserValidationDocument('123'),
      ).rejects.toThrow('El Documento que esta solicitando no existe!');
    });

    it('throws when http request fails', async () => {
      httpService.post.mockReturnValueOnce(
        throwError(() => ({ response: { data: 'fail' } })),
      );

      await expect(
        service.findProuserValidationDocument('123'),
      ).rejects.toEqual('fail');
    });
  });
});
