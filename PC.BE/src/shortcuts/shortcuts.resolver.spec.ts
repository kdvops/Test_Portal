import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ShortcutsResolver } from './shortcuts.resolver';
import { ShortcutsService } from './shortcuts.service';
import { Shortcuts } from './schema/shortcuts.schema';
import {
  StyleAlignShortcut,
  StyleCardShortcut,
  TargetShortcut,
  TypeShortcut,
} from 'src/common/enums/shortcut.enums';

describe('ShortcutsResolver', () => {
  let resolver: ShortcutsResolver;
  let service: jest.Mocked<ShortcutsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ShortcutsService> = {
      updateShortcuts: jest.fn(),
      createShortcuts: jest.fn(),
      removeShortcuts: jest.fn(),
      findShortcutsByTarget: jest.fn(),
      findShortcutsByTargetId: jest.fn(),
      shortcutsGroupByTarget: jest.fn(),
      findShortcutsGroupByTargetId: jest.fn(),
      findShortcutById: jest.fn(),
      findShortcuts: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortcutsResolver,
        { provide: ShortcutsService, useValue: serviceMock },
        { provide: getModelToken(Shortcuts.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<ShortcutsResolver>(ShortcutsResolver);
    service = module.get(ShortcutsService) as jest.Mocked<ShortcutsService>;
  });

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
      targetID: new Types.ObjectId(),
      cards: [makeCard()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      shortcutID: new Types.ObjectId(),
      shortcut: {
        name: 'Shortcuts',
        icon: 'mdi-home',
        color: '#000',
        background: '#fff',
        disabled: false,
        type: TypeShortcut.shortcutCards,
        target: TargetShortcut.targetHome,
        targetID: new Types.ObjectId(),
        cards: [makeCard({ _id: new Types.ObjectId() })],
      },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeShortcuts', () => {
      expect(() => resolver.removeShortcuts('not-an-id')).toThrow(
        'Invalid shortcutID',
      );
      expect(service.removeShortcuts).not.toHaveBeenCalled();
    });

    it('rejects findShortcutById', () => {
      expect(() => resolver.findShortcutById('not-an-id')).toThrow(
        'Invalid shortcutID',
      );
      expect(service.findShortcutById).not.toHaveBeenCalled();
    });

    it('rejects findShortcutsByTargetId', () => {
      expect(() => resolver.findShortcutsByTargetId('not-an-id')).toThrow(
        'Invalid targetID',
      );
      expect(service.findShortcutsByTargetId).not.toHaveBeenCalled();
    });
  });

  describe('createShortcuts', () => {
    it('normalizes missing cards', async () => {
      service.createShortcuts.mockResolvedValueOnce({} as any);

      await resolver.createShortcuts(makeCreateDto({ cards: undefined }));

      expect(service.createShortcuts).toHaveBeenCalledWith(
        expect.objectContaining({ cards: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createShortcuts.mockResolvedValueOnce({} as any);

      await resolver.createShortcuts(makeCreateDto());

      expect(service.createShortcuts).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Shortcuts' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createShortcuts(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createShortcuts).not.toHaveBeenCalled();
    });

    it('rejects invalid enum values', async () => {
      await expect(
        resolver.createShortcuts(makeCreateDto({ type: 'bad', target: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createShortcuts).not.toHaveBeenCalled();
    });

    it('rejects null cards', async () => {
      await expect(
        resolver.createShortcuts(makeCreateDto({ cards: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createShortcuts).not.toHaveBeenCalled();
    });
  });

  describe('updateShortcuts', () => {
    it('normalizes missing cards', async () => {
      const dto = makeUpdateDto({
        shortcut: { ...makeUpdateDto().shortcut, cards: undefined },
      });
      service.updateShortcuts.mockResolvedValueOnce({} as any);

      await resolver.updateShortcuts(dto);

      expect(service.updateShortcuts).toHaveBeenCalledWith(
        expect.objectContaining({
          shortcut: expect.objectContaining({ cards: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateShortcuts.mockResolvedValueOnce({} as any);

      await resolver.updateShortcuts(dto);

      expect(service.updateShortcuts).toHaveBeenCalledWith(dto);
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateShortcuts(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateShortcuts).not.toHaveBeenCalled();
    });

    it('rejects invalid enum values', async () => {
      await expect(
        resolver.updateShortcuts(
          makeUpdateDto({
            shortcut: { ...makeUpdateDto().shortcut, type: 'bad' },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateShortcuts).not.toHaveBeenCalled();
    });

    it('rejects null cards', async () => {
      await expect(
        resolver.updateShortcuts(
          makeUpdateDto({
            shortcut: { ...makeUpdateDto().shortcut, cards: null },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateShortcuts).not.toHaveBeenCalled();
    });
  });

  describe('findShortcutsByTarget', () => {
    it('rejects missing target', () => {
      expect(() => resolver.findShortcutsByTarget('')).toThrow(
        BadRequestException,
      );
      expect(service.findShortcutsByTarget).not.toHaveBeenCalled();
    });

    it('rejects invalid target enum', () => {
      expect(() => resolver.findShortcutsByTarget('target::bad')).toThrow(
        BadRequestException,
      );
      expect(service.findShortcutsByTarget).not.toHaveBeenCalled();
    });

    it('delegates with valid target', async () => {
      service.findShortcutsByTarget.mockResolvedValueOnce([]);

      await resolver.findShortcutsByTarget(TargetShortcut.targetHome);

      expect(service.findShortcutsByTarget).toHaveBeenCalledWith(
        TargetShortcut.targetHome,
      );
    });
  });
});
