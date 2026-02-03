import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ShortcutsService } from './shortcuts.service';
import { Shortcuts } from './schema/shortcuts.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName } from 'src/common/constants';
import { getImageDetail } from 'src/common/utils/fileHandler';
import {
  StyleAlignShortcut,
  StyleCardShortcut,
  TargetShortcut,
  TypeShortcut,
} from 'src/common/enums/shortcut.enums';

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

const makeCard = (overrides: Record<string, any> = {}) => ({
  title: { text: 'Title', color: '#000' },
  description: { text: 'Desc', color: '#000' },
  style: StyleCardShortcut.cardsShortcutSmall,
  align: StyleAlignShortcut.alignLeft,
  picture: null,
  pictureImageDetail: { image: 'data:image/png;base64,' },
  newUploadPicture: [],
  background: '#fff',
  button: {
    text: 'Go',
    color: '#000',
    link: '/go',
    background: '#fff',
    enabled: true,
  },
  icon: 'mdi-home',
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, any> = {}) =>
  ({
    name: 'Shortcuts',
    icon: 'mdi-home',
    color: '#000',
    background: '#fff',
    disabled: false,
    type: TypeShortcut.shortcutCards,
    target: TargetShortcut.targetHome,
    targetID: makeObjectId(),
    cards: [makeCard()],
    ...overrides,
  }) as any;

const makeUpdateDto = (overrides: Record<string, any> = {}) =>
  ({
    shortcutID: makeObjectId(),
    shortcut: {
      name: 'Shortcuts',
      icon: 'mdi-home',
      color: '#000',
      background: '#fff',
      disabled: false,
      type: TypeShortcut.shortcutCards,
      target: TargetShortcut.targetHome,
      targetID: makeObjectId(),
      cards: [makeCard({ _id: makeObjectId() })],
    },
    ...overrides,
  }) as any;

describe('ShortcutsService', () => {
  let service: ShortcutsService;
  let shortcutsModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    shortcutsModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortcutsService,
        { provide: getModelToken(Shortcuts.name), useValue: shortcutsModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<ShortcutsService>(ShortcutsService);

    jest.clearAllMocks();
    mockGetImageDetail.mockResolvedValue({ image: 'detail.png' });
  });

  describe('createShortcuts', () => {
    it('creates shortcuts with cards', async () => {
      shortcutsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createShortcuts(makeCreateDto());

      const payload = shortcutsModel.create.mock.calls[0][0];
      expect(payload.cards).toHaveLength(1);
      expect(payload.cards[0].picture).toBeNull();
      expect(payload.cards[0].pictureImageDetail).toEqual({ image: 'detail.png' });
    });
  });

  describe('updateShortcuts', () => {
    it('updates cards and removes deleted ones', async () => {
      const dto = makeUpdateDto({
        shortcut: {
          ...makeUpdateDto().shortcut,
          cards: [
            { ...makeCard(), _id: makeObjectId(), status: 'remove' },
            { ...makeCard(), _id: makeObjectId(), status: 'update' },
          ],
        },
      });
      shortcutsModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.shortcutID,
      });
      const removeSpy = jest
        .spyOn(service, 'removeFilesItem')
        .mockResolvedValue(undefined);

      await service.updateShortcuts(dto);

      const payload = shortcutsModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.cards).toHaveLength(1);
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe('shortcutsGroupByTarget', () => {
    it('aggregates shortcuts by target', async () => {
      shortcutsModel.aggregate.mockReturnValueOnce([]);

      await service.shortcutsGroupByTarget(false);

      expect(shortcutsModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findShortcutsGroupByTargetId', () => {
    it('aggregates shortcuts by target id', async () => {
      shortcutsModel.aggregate.mockReturnValueOnce([]);

      await service.findShortcutsGroupByTargetId(makeObjectId(), false);

      expect(shortcutsModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeFiles', () => {
    it('skips removal when query is missing', async () => {
      shortcutsModel.findById.mockReturnValueOnce(undefined);

      await service.removeFiles(makeObjectId());

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes card image detail when present', async () => {
      const detailUrl = `https://storage/${ASContainerName}detail.png`;
      shortcutsModel.findById.mockReturnValueOnce(
        makeQueryMock({
          cards: [{ pictureImageDetail: { image: detailUrl } }],
        }),
      );

      await service.removeFiles(makeObjectId());

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: expect.stringContaining('detail.png') }),
      ]);
    });
  });

  describe('removeFilesItem', () => {
    it('skips removal when query is missing', async () => {
      shortcutsModel.findById.mockReturnValueOnce(undefined);

      await service.removeFilesItem(makeObjectId(), makeObjectId());

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes card image when present', async () => {
      const imageUrl = `https://storage/${ASContainerName}card.png`;
      const cardId = makeObjectId();
      shortcutsModel.findById.mockReturnValueOnce(
        makeQueryMock({
          cards: [{ _id: cardId, picture: imageUrl }],
        }),
      );

      await service.removeFilesItem(makeObjectId(), cardId);

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: expect.stringContaining('card.png') }),
      ]);
    });
  });
});
