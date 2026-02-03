import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SlidersResolver } from './sliders.resolver';
import { SlidersService } from './sliders.service';
import { Sliders } from './schema/sliders.schema';
import { TargetSliders } from 'src/common/enums/target.enum';

describe('SlidersResolver', () => {
  let resolver: SlidersResolver;
  let service: jest.Mocked<SlidersService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<SlidersService> = {
      updateSliders: jest.fn(),
      createSliders: jest.fn(),
      sliders: jest.fn(),
      removeSliders: jest.fn(),
      findSliderById: jest.fn(),
      findSlidersByTarget: jest.fn(),
      findSliderByTargetId: jest.fn(),
      updateSlidersPositions: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlidersResolver,
        { provide: SlidersService, useValue: serviceMock },
        { provide: getModelToken(Sliders.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<SlidersResolver>(SlidersResolver);
    service = module.get(SlidersService) as jest.Mocked<SlidersService>;
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
      targetID: new Types.ObjectId().toString(),
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
      _id: new Types.ObjectId(),
      title: makeFeatureText(),
      subtitle: makeFeatureText(),
      description: makeFeatureText(),
      button: makeFeatureButton(),
      targetID: new Types.ObjectId(),
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

  describe('invalid ids', () => {
    it('rejects removeSlider', () => {
      expect(() => resolver.removeSlider('not-an-id')).toThrow(
        'Invalid sliderID',
      );
      expect(service.removeSliders).not.toHaveBeenCalled();
    });

    it('rejects findSliderById', () => {
      expect(() => resolver.findSliderById('not-an-id')).toThrow(
        'Invalid sliderID',
      );
      expect(service.findSliderById).not.toHaveBeenCalled();
    });
  });

  describe('createSlider', () => {
    it('delegates with valid payload', async () => {
      service.createSliders.mockResolvedValueOnce({} as any);

      await resolver.createSlider(makeCreateDto());

      expect(service.createSliders).toHaveBeenCalledWith(
        expect.objectContaining({ target: TargetSliders.bannerHome }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createSlider(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createSliders).not.toHaveBeenCalled();
    });

    it('rejects invalid target enum', async () => {
      await expect(
        resolver.createSlider(makeCreateDto({ target: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createSliders).not.toHaveBeenCalled();
    });
  });

  describe('updateSlider', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateSliders.mockResolvedValueOnce({} as any);

      await resolver.updateSlider(dto);

      expect(service.updateSliders).toHaveBeenCalledWith(
        expect.objectContaining({ _id: dto._id }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateSlider(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateSliders).not.toHaveBeenCalled();
    });
  });

  describe('findSliderByTarget', () => {
    it('rejects missing target', () => {
      expect(() => resolver.findSliderByTarget('')).toThrow(
        BadRequestException,
      );
      expect(service.findSlidersByTarget).not.toHaveBeenCalled();
    });

    it('rejects invalid target enum', () => {
      expect(() => resolver.findSliderByTarget('bad')).toThrow(
        BadRequestException,
      );
      expect(service.findSlidersByTarget).not.toHaveBeenCalled();
    });

    it('delegates with valid target', async () => {
      service.findSlidersByTarget.mockResolvedValueOnce([]);

      await resolver.findSliderByTarget(TargetSliders.bannerHome);

      expect(service.findSlidersByTarget).toHaveBeenCalledWith(
        TargetSliders.bannerHome,
      );
    });
  });

  describe('updateSlidersPositions', () => {
    it('rejects missing sliders array', async () => {
      await expect(
        resolver.updateSlidersPositions({ sliders: null } as any),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateSlidersPositions).not.toHaveBeenCalled();
    });

    it('delegates with valid payload', async () => {
      service.updateSlidersPositions.mockResolvedValueOnce([]);

      await resolver.updateSlidersPositions({
        sliders: [{ id: new Types.ObjectId().toString(), position: 1 }],
      } as any);

      expect(service.updateSlidersPositions).toHaveBeenCalled();
    });
  });
});
