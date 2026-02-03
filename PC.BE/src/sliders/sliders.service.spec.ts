import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SlidersService } from './sliders.service';
import { Sliders } from './schema/sliders.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName } from 'src/common/constants';
import { TargetSliders } from 'src/common/enums/target.enum';

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

describe('SlidersService', () => {
  let service: SlidersService;
  let sliderModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    sliderModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      bulkWrite: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlidersService,
        { provide: getModelToken(Sliders.name), useValue: sliderModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<SlidersService>(SlidersService);

    jest.clearAllMocks();
  });

  const makeFeatureText = () => ({
    text: 'Text',
    align: 'left',
    size: 'md',
    color: '#000',
    weight: '400',
  });

  const makeFeatureButton = () => ({
    enabled: true,
    link: '/go',
    text: 'Go',
    align: 'left',
    color: '#000',
    weight: '400',
    background: '#fff',
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: makeFeatureText(),
      subtitle: makeFeatureText(),
      description: makeFeatureText(),
      button: makeFeatureButton(),
      targetID: makeObjectId().toString(),
      target: TargetSliders.bannerHome,
      picture: null,
      responsive: null,
      pictureImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      altTextPicture: '',
      caption: '',
      order: 1,
      expirationDate: null,
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      _id: makeObjectId(),
      title: makeFeatureText(),
      subtitle: makeFeatureText(),
      description: makeFeatureText(),
      button: makeFeatureButton(),
      targetID: makeObjectId(),
      target: TargetSliders.bannerHome,
      picture: null,
      responsive: null,
      pictureImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      altTextPicture: '',
      caption: '',
      order: 1,
      expirationDate: null,
      ...overrides,
    }) as any;

  describe('createSliders', () => {
    it('creates slider with image details', async () => {
      sliderModel.create.mockResolvedValueOnce({ _id: makeObjectId() });
      jest
        .spyOn(service, 'getImageDetail')
        .mockResolvedValueOnce({ image: 'picture.png', altText: '' })
        .mockResolvedValueOnce({ image: 'responsive.png', altText: '' });

      await service.createSliders(makeCreateDto());

      const payload = sliderModel.create.mock.calls[0][0];
      expect(payload.picture).toBeNull();
      expect(payload.pictureImageDetail).toEqual({
        image: 'picture.png',
        altText: '',
      });
    });
  });

  describe('updateSliders', () => {
    it('updates slider and normalizes images', async () => {
      const dto = makeUpdateDto();
      sliderModel.findOneAndUpdate.mockResolvedValueOnce({ _id: dto._id });
      jest
        .spyOn(service, 'getImageDetail')
        .mockResolvedValueOnce({ image: 'picture.png', altText: '' })
        .mockResolvedValueOnce({ image: 'responsive.png', altText: '' });

      await service.updateSliders(dto);

      const payload = sliderModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.picture).toBeNull();
      expect(payload.responsive).toBeNull();
      expect(payload.pictureImageDetail).toEqual({
        image: 'picture.png',
        altText: '',
      });
    });
  });

  describe('updateSlidersPositions', () => {
    it('bulk updates positions', async () => {
      sliderModel.find.mockResolvedValueOnce([]);

      await service.updateSlidersPositions({
        sliders: [
          { id: makeObjectId().toString(), position: 1 },
          { id: makeObjectId().toString(), position: 2 },
        ],
      } as any);

      expect(sliderModel.bulkWrite).toHaveBeenCalledTimes(1);
      expect(sliderModel.find).toHaveBeenCalled();
    });
  });

  describe('removeFiles', () => {
    it('skips removal when query is missing', async () => {
      sliderModel.findById.mockReturnValueOnce(undefined);

      await service.removeFiles(makeObjectId(), 'picture');

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes image detail when present', async () => {
      const detailUrl = `https://storage/${ASContainerName}detail.png`;
      sliderModel.findById.mockReturnValueOnce(
        makeQueryMock({ pictureImageDetail: { image: detailUrl } }),
      );

      await service.removeFiles(makeObjectId(), 'pictureImageDetail');

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: expect.stringContaining('detail.png') }),
      ]);
    });
  });
});
