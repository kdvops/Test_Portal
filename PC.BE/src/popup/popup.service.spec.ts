import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PopupService } from './popup.service';
import { Popup } from './schema/popup.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { OrientationPopup } from 'src/common/enums/popup.enum';
import { ASContainerName } from 'src/common/constants';

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

describe('PopupService', () => {
  let service: PopupService;
  let popupModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    popupModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopupService,
        { provide: getModelToken(Popup.name), useValue: popupModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<PopupService>(PopupService);

    jest.clearAllMocks();
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      excerpt: 'Excerpt',
      subtitle: 'Subtitle',
      description: 'Description',
      orientation: OrientationPopup.popupBottomCenter,
      button: null,
      background: '#fff',
      color: '#000',
      link: 'https://example.com',
      image: [],
      active: false,
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      popupID: makeObjectId(),
      newImagePopup: [],
      popup: {
        title: 'Title',
        excerpt: 'Excerpt',
        subtitle: 'Subtitle',
        description: 'Description',
        button: null,
        background: '#fff',
        color: '#000',
        orientation: OrientationPopup.popupBottomCenter,
        link: 'https://example.com',
        image: '',
        active: false,
      },
      ...overrides,
    }) as any;

  describe('createPopup', () => {
    it('creates popup and sets image when upload data exists', async () => {
      const dto = makeCreateDto({
        image: [{ img: 'base64', filetype: 'jpg' }],
      });
      azureService.upload.mockResolvedValueOnce({ Location: 'uploaded' });
      popupModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createPopup(dto);

      const payload = popupModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.image).toBe('uploaded');
    });
  });

  describe('updatePopup', () => {
    it('updates popup fields', async () => {
      const dto = makeUpdateDto();
      popupModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.popupID,
      });

      await service.updatePopup(dto);

      expect(popupModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto.popupID },
        expect.objectContaining({ $set: dto.popup }),
        { new: true },
      );
    });
  });

  describe('activePopup', () => {
    it('deactivates current and activates selected', async () => {
      const popupID = makeObjectId();
      popupModel.find.mockResolvedValueOnce([
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ]);
      popupModel.findOneAndUpdate.mockResolvedValue({ _id: popupID });

      await service.activePopup(popupID);

      expect(popupModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('findPopupByActive', () => {
    it('returns active popup', async () => {
      popupModel.findOne.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.findPopupByActive();

      expect(popupModel.findOne).toHaveBeenCalledWith({
        active: true,
        deletedAt: null,
      });
    });
  });

  describe('findPopups', () => {
    it('returns non-deleted popups', async () => {
      popupModel.find.mockResolvedValueOnce([]);

      await service.findPopups();

      expect(popupModel.find).toHaveBeenCalledWith({ deletedAt: null });
    });
  });

  describe('findPopupById', () => {
    it('returns popup by id', async () => {
      const popupID = makeObjectId();
      popupModel.findById.mockResolvedValueOnce({ _id: popupID });

      await service.findPopupById(popupID);

      expect(popupModel.findById).toHaveBeenCalledWith(popupID);
    });
  });

  describe('removePopup', () => {
    it('soft deletes popup', async () => {
      const popupID = makeObjectId();
      popupModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: popupID,
      });

      await service.removePopup(popupID);

      const payload = popupModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeFiles', () => {
    it('removes image when present', async () => {
      const popupID = makeObjectId();
      const imageUrl = `${ASContainerName}popup/image.png`;
      popupModel.findById.mockReturnValueOnce(
        makeQueryMock({ image: imageUrl }),
      );

      await service.removeFiles(popupID);

      expect(azureService.remove).toHaveBeenCalledWith([{ Key: imageUrl }]);
    });

    it('skips removal when missing image', async () => {
      const popupID = makeObjectId();
      popupModel.findById.mockReturnValueOnce(makeQueryMock({ image: null }));

      await service.removeFiles(popupID);

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });
});
