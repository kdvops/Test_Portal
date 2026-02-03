import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SectionsService } from './sections.service';
import { Sections } from './schema/sections.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName } from 'src/common/constants';
import { TypeSection } from 'src/common/enums/sections.enums';
import { getImageDetail } from 'src/common/utils/fileHandler';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makeSectionBase = (overrides: Record<string, any> = {}) => ({
  name: 'Section',
  description: 'Desc',
  color: '',
  position: 1,
  type: TypeSection.sectionCards,
  cards: [],
  banner: null,
  attachments: [],
  image: null,
  imageDetail: null,
  grids: [],
  gallery: null,
  ...overrides,
});

const makeCard = (overrides: Record<string, any> = {}) => ({
  name: 'Card',
  description: 'Card desc',
  link: '',
  picture: null,
  pictureImageDetail: { image: 'data:image/png;base64,' },
  newUploadPictureItem: [],
  ...overrides,
});

const makeAttachment = (overrides: Record<string, any> = {}) => ({
  name: 'Attachment',
  description: 'Desc',
  file: 'https://files/test.pdf',
  newUploadFileItem: [],
  ...overrides,
});

const makeBanner = (overrides: Record<string, any> = {}) => ({
  title: { text: 'Title', color: '#000' },
  description: { text: 'Desc', color: '#000' },
  background: '#fff',
  button: {
    text: 'Go',
    color: '#000',
    link: '/go',
    background: '#fff',
    enabled: true,
  },
  picture: null,
  pictureImageDetail: { image: 'data:image/png;base64,' },
  newUploadPictureItem: [],
  ...overrides,
});

const makeGallery = (overrides: Record<string, any> = {}) => ({
  items: [
    {
      name: 'Item',
      description: 'Desc',
      image: null,
      icon: null,
      imageDetail: { image: 'data:image/png;base64,' },
      iconImageDetail: { image: 'data:image/png;base64,' },
      ...overrides,
    },
  ],
});

const makeGrid = (overrides: Record<string, any> = {}) => ({
  layouts: [
    {
      i: '0',
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      image: null,
      imageDetail: { image: 'data:image/png;base64,' },
      button: {
        text: 'Go',
        color: '#000',
        href: '/go',
        icon: null,
        picture: null,
        pictureImageDetail: { image: 'data:image/png;base64,' },
        iconImageDetail: { image: 'data:image/png;base64,' },
      },
      ...overrides,
    },
  ],
});

describe('SectionsService', () => {
  let service: SectionsService;
  let sectionModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    sectionModel = {
      findById: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: getModelToken(Sections.name), useValue: sectionModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);

    jest.clearAllMocks();
    mockGetImageDetail.mockResolvedValue({ image: 'detail.png' });
  });

  describe('createSections', () => {
    it('creates cards section with normalized images', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionCards,
        cards: [makeCard()],
      });

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.cards[0].picture).toBeNull();
      expect(payload.cards[0].pictureImageDetail).toEqual({
        image: 'detail.png',
      });
      expect(payload.banner).toBeNull();
    });

    it('creates banner section with image detail', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionBanner,
        banner: makeBanner(),
      });

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.banner.picture).toBeNull();
      expect(payload.banner.pictureImageDetail).toEqual({
        image: 'detail.png',
      });
    });

    it('creates attachments section with uploaded file', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionAttachments,
        attachments: [
          makeAttachment({
            newUploadFileItem: [{ file: 'base64', filetype: 'pdf' }],
          }),
        ],
      });
      jest
        .spyOn(service, 'checkUploadFileSection')
        .mockResolvedValueOnce('https://storage/file.pdf');

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.attachments[0].file).toBe('https://storage/file.pdf');
    });

    it('creates image section with image detail', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionImage,
        imageDetail: { image: 'data:image/png;base64,' },
      });

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.image).toBeNull();
      expect(payload.imageDetail).toEqual({ image: 'detail.png' });
    });

    it('creates grids section with layouts', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionGrids,
        grids: [makeGrid()],
      });

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.grids[0].layouts[0].image).toBeNull();
      expect(payload.grids[0].layouts[0].imageDetail).toEqual({
        image: 'detail.png',
      });
    });

    it('creates gallery section with items', async () => {
      sectionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      const dto = makeSectionBase({
        type: TypeSection.sectionGallery,
        gallery: makeGallery(),
      });

      await service.createSections(dto as any);

      const payload = sectionModel.create.mock.calls[0][0];
      expect(payload.gallery.items[0].image).toBeNull();
      expect(payload.gallery.items[0].imageDetail).toEqual({
        image: 'detail.png',
      });
    });
  });

  describe('updateSections', () => {
    it('updates cards and removes deleted ones', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const removeSpy = jest
        .spyOn(service, 'removeFilesItem')
        .mockResolvedValue(undefined);
      const dto = {
        sectionID: makeObjectId(),
        section: makeSectionBase({
          type: TypeSection.sectionCards,
          cards: [
            { ...makeCard(), _id: makeObjectId(), status: 'remove' },
            { ...makeCard(), _id: makeObjectId(), status: 'update' },
          ],
        }),
      };

      await service.updateSections(dto as any);

      const payload = sectionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.cards).toHaveLength(1);
      expect(removeSpy).toHaveBeenCalled();
    });

    it('updates banner with new image detail', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const dto = {
        sectionID: makeObjectId(),
        section: makeSectionBase({
          type: TypeSection.sectionBanner,
          banner: { ...makeBanner(), _id: makeObjectId() },
        }),
      };

      await service.updateSections(dto as any);

      const payload = sectionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.banner.picture).toBeNull();
      expect(payload.banner.pictureImageDetail).toEqual({
        image: 'detail.png',
      });
    });

    it('updates attachments and filters removed ones', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const dto = {
        sectionID: makeObjectId(),
        section: makeSectionBase({
          type: TypeSection.sectionAttachments,
          attachments: [
            { ...makeAttachment(), _id: makeObjectId(), status: 'remove' },
            {
              ...makeAttachment(),
              _id: makeObjectId(),
              status: 'update',
              newUploadFileItem: [{ file: 'base64', filetype: 'pdf' }],
            },
          ],
        }),
      };
      jest
        .spyOn(service, 'checkUploadFileSection')
        .mockResolvedValueOnce('https://storage/file.pdf');

      await service.updateSections(dto as any);

      const payload = sectionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.attachments).toHaveLength(1);
      expect(payload.attachments[0].file).toBe('https://storage/file.pdf');
    });

    it('updates grids and removes deleted layouts', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const dto = {
        sectionID: makeObjectId(),
        section: makeSectionBase({
          type: TypeSection.sectionGrids,
          grids: [
            {
              _id: makeObjectId(),
              layouts: [
                {
                  ...makeGrid().layouts[0],
                  _id: makeObjectId(),
                  status: 'remove',
                },
                {
                  ...makeGrid().layouts[0],
                  _id: makeObjectId(),
                  status: 'update',
                },
              ],
            },
          ],
        }),
      };

      await service.updateSections(dto as any);

      const payload = sectionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.grids[0].layouts).toHaveLength(1);
    });

    it('updates gallery and filters removed items', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const dto = {
        sectionID: makeObjectId(),
        section: makeSectionBase({
          type: TypeSection.sectionGallery,
          gallery: {
            items: [
              {
                ...makeGallery().items[0],
                _id: makeObjectId(),
                status: 'remove',
              },
              {
                ...makeGallery().items[0],
                _id: makeObjectId(),
                status: 'update',
              },
            ],
          },
        }),
      };

      await service.updateSections(dto as any);

      const payload = sectionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.gallery.items).toHaveLength(1);
    });
  });

  describe('removeSections', () => {
    it('removes files for card sections', async () => {
      sectionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: makeObjectId(),
      });
      const removeSpy = jest
        .spyOn(service, 'removeFiles')
        .mockResolvedValue(undefined);

      await service.removeSections({
        _id: makeObjectId(),
        type: TypeSection.sectionCards,
      });

      expect(removeSpy).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        'cards',
      );
    });
  });

  describe('removeFiles', () => {
    it('skips removal when query is missing', async () => {
      const sectionID = makeObjectId();
      sectionModel.findById.mockReturnValueOnce(undefined);

      await service.removeFiles(sectionID, 'banner');

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('skips removal when section is missing', async () => {
      const sectionID = makeObjectId();
      sectionModel.findById.mockReturnValueOnce(makeQueryMock(null));

      await service.removeFiles(sectionID, 'banner');

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes banner picture when present', async () => {
      const sectionID = makeObjectId();
      const bannerUrl = `https://storage/${ASContainerName}banner.png`;
      sectionModel.findById.mockReturnValueOnce(
        makeQueryMock({ banner: { picture: bannerUrl } }),
      );

      await service.removeFiles(sectionID, 'banner');

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: expect.stringContaining('banner.png') }),
      ]);
    });
  });

  describe('removeFilesItem', () => {
    it('skips removal when query is missing', async () => {
      const sectionID = makeObjectId();
      sectionModel.findById.mockReturnValueOnce(undefined);

      await service.removeFilesItem(sectionID, null, 'banner');

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes banner image detail when present', async () => {
      const sectionID = makeObjectId();
      const detailUrl = `https://storage/${ASContainerName}detail.png`;
      sectionModel.findById.mockReturnValueOnce(
        makeQueryMock({
          banner: { pictureImageDetail: { image: detailUrl } },
        }),
      );

      await service.removeFilesItem(sectionID, null, 'banner');

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: expect.stringContaining('detail.png') }),
      ]);
    });
  });
});
