import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PopupResolver } from './popup.resolver';
import { PopupService } from './popup.service';
import { Popup } from './schema/popup.schema';
import { OrientationPopup } from 'src/common/enums/popup.enum';

describe('PopupResolver', () => {
  let resolver: PopupResolver;
  let service: jest.Mocked<PopupService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<PopupService> = {
      updatePopup: jest.fn(),
      createPopup: jest.fn(),
      removePopup: jest.fn(),
      activePopup: jest.fn(),
      findPopupByActive: jest.fn(),
      findPopups: jest.fn(),
      findPopupById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopupResolver,
        { provide: PopupService, useValue: serviceMock },
        { provide: getModelToken(Popup.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<PopupResolver>(PopupResolver);
    service = module.get(PopupService) as jest.Mocked<PopupService>;
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
      popupID: new Types.ObjectId(),
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

  describe('invalid ids', () => {
    it('rejects removePopup', () => {
      expect(() => resolver.removePopup('not-an-id')).toThrow(
        'Invalid popupID',
      );
      expect(service.removePopup).not.toHaveBeenCalled();
    });

    it('rejects activePopup', () => {
      expect(() => resolver.activePopup('not-an-id')).toThrow(
        'Invalid popupID',
      );
      expect(service.activePopup).not.toHaveBeenCalled();
    });

    it('rejects findPopupById', () => {
      expect(() => resolver.findPopupById('not-an-id')).toThrow(
        'Invalid popupID',
      );
      expect(service.findPopupById).not.toHaveBeenCalled();
    });
  });

  describe('createPopup', () => {
    it('delegates with valid payload', async () => {
      service.createPopup.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createPopup(makeCreateDto());

      expect(service.createPopup).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createPopup(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPopup).not.toHaveBeenCalled();
    });

    it('rejects invalid orientation enum', async () => {
      await expect(
        resolver.createPopup(makeCreateDto({ orientation: 'invalid' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPopup).not.toHaveBeenCalled();
    });

    it('rejects null image', async () => {
      await expect(
        resolver.createPopup(makeCreateDto({ image: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPopup).not.toHaveBeenCalled();
    });
  });

  describe('updatePopup', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updatePopup.mockResolvedValueOnce({
        _id: dto.popupID,
      } as any);

      await resolver.updatePopup(dto);

      expect(service.updatePopup).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updatePopup(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updatePopup).not.toHaveBeenCalled();
    });

    it('rejects extra popup fields', async () => {
      const dto = makeUpdateDto({
        popup: { ...makeUpdateDto().popup, extra: 'bad' },
      });

      await expect(resolver.updatePopup(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePopup).not.toHaveBeenCalled();
    });

    it('rejects invalid orientation enum', async () => {
      const dto = makeUpdateDto({
        popup: { ...makeUpdateDto().popup, orientation: 'invalid' },
      });

      await expect(resolver.updatePopup(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePopup).not.toHaveBeenCalled();
    });

    it('rejects null popup image', async () => {
      const dto = makeUpdateDto({
        popup: { ...makeUpdateDto().popup, image: null },
      });

      await expect(resolver.updatePopup(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePopup).not.toHaveBeenCalled();
    });
  });

  describe('findPopups', () => {
    it('delegates to service', async () => {
      service.findPopups.mockResolvedValueOnce([]);

      await resolver.findPopups();

      expect(service.findPopups).toHaveBeenCalledWith();
    });
  });

  describe('findPopupByActive', () => {
    it('delegates to service', async () => {
      service.findPopupByActive.mockResolvedValueOnce({} as any);

      await resolver.findPopupByActive();

      expect(service.findPopupByActive).toHaveBeenCalledWith();
    });
  });
});
