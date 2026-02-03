import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT SHORTCUTS SCHEMA
import { Shortcuts, ShortcutsDocument } from './schema/shortcuts.schema';

// IMPORT DTO
import { CreateShortcutsDto } from './dto/create.shortcuts.dto';
import { ShortcutsGroupByTarget } from './dto/args.shortcuts.dto';
import { UpdateShortcutsDto } from './dto/update.shortcuts.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import {
  CardShortcutInputCreate,
  CardShortcutInputUpdate,
} from 'src/common/types/shortcuts.type';

// IMPORT LODASH
import * as _ from 'lodash';
import { ASContainerName, ImageCompression } from 'src/common/constants';
import { getImageDetail } from 'src/common/utils/fileHandler';

@Injectable()
export class ShortcutsService {
  constructor(
    @InjectModel(Shortcuts.name)
    private shortcutsModel: Model<ShortcutsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // CREATE SHORTCUTS
  async createShortcuts(
    createShortcutsDto: CreateShortcutsDto,
  ): Promise<Shortcuts> {
    // CREATE ID SECTION
    const _id: any = new Types.ObjectId();

    // VALIDATE TYPE SECTION FIRST
    const cards =
      createShortcutsDto.cards.length > 0
        ? await this.uploadCardsShortcuts(createShortcutsDto, _id)
        : [];

    // RETURN SHORTCUTS
    return await this.shortcutsModel.create({
      // SET ALL DATA DTO
      ...createShortcutsDto,

      // SET ID
      _id,

      // SET CARDS
      cards,
    });
  }

  // UPDATE SHORTCUTS
  async updateShortcuts(
    updateSectionDto: UpdateShortcutsDto,
  ): Promise<Shortcuts> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // VALIDATE TYPE SECTION FIRST
    const updateCardsSection =
      updateSectionDto.shortcut.cards.length > 0
        ? await this.updateCardsShortcuts(updateSectionDto)
        : updateSectionDto.shortcut.cards;

    return await this.shortcutsModel.findOneAndUpdate(
      { _id: updateSectionDto.shortcutID },
      {
        $set: updateSectionDto.shortcut,
        cards: updateCardsSection,
        updatedAt,
      },
      { new: true },
    );
  }

  // UPDATE SHORTCUTS CARDS
  async updateCardsShortcuts(updateShortcutsDto: UpdateShortcutsDto) {
    // UPLOAD CARDS
    const cards = await Promise.all(
      updateShortcutsDto.shortcut.cards.map(
        async (card: CardShortcutInputUpdate) => {
          // VALIDATE CARD STATUS
          if (card.status && card.status === 'remove') {
            // REMOVE SECTION CARDS
            card._id &&
              (await this.removeFilesItem(
                updateShortcutsDto.shortcutID,
                card._id,
              ));

            // REMOVE CARD
            return null;
          } else if (card.status && card.status === 'update') {
            const pictureImageDetail = await getImageDetail(
              updateShortcutsDto.shortcutID,
              card.picture,
              card.pictureImageDetail,
              'shortcuts',
              async () =>
                await this.removeFilesItem(
                  updateShortcutsDto.shortcutID,
                  card._id,
                ),
            );

            // REMOVE NEW PICTURE CARD
            const cardClean = _.omit(card, ['newUploadPicture', 'status']);

            // RETURN CARD UPDATE
            return {
              ...cardClean,
              _id: cardClean._id,
              picture: null,
              pictureImageDetail,
            };
          } else if (card.status && card.status === 'create') {
            // CREATE ID SECTION
            const _id: any = new Types.ObjectId();

            const pictureImageDetail = await getImageDetail(
              _id,
              null,
              card.pictureImageDetail,
              'shortcuts',
              null,
              'create',
            );

            // REMOVE NEW PICTURE CARD
            const cardClean = _.omit(card, ['newUploadPicture', 'status']);

            // RETURN CARD CREATE
            return {
              // SET ALL DATA DTO
              ...cardClean,

              // SET ID
              _id,

              // SET PICTURE UPLOAD
              picture: null,
              pictureImageDetail,
            };
          } else {
            // REMOVE UNNECESSARY ATTRIBUTES
            const cardClean = _.omit(card, ['newUploadPicture', 'status']);

            // RETURN CARD UPDATE
            return {
              ...cardClean,
              _id: cardClean._id,
            };
          }
        },
      ),
    );

    // REMOVE NULL CARDS
    const cleanCards = cards.filter((card) => card !== null);

    // RETURN CARDS
    return cleanCards;
  }

  // REMOVE SECTION COMPLETE
  async removeShortcuts(shortcutsID: Types.ObjectId) {
    // REMOVE SECTION CARDS
    // await this.removeFiles(shortcutsID);

    // REMOVE SHORTCUT DATE
    const deletedAt: Date = new Date();

    return await this.shortcutsModel.findOneAndUpdate(
      { _id: shortcutsID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // GET ALL SHORTCUTS GROUP BY TARGETS
  async shortcutsGroupByTarget(
    findAll: boolean = false,
  ): Promise<ShortcutsGroupByTarget[]> {
    const disabled = findAll ? null : { disabled: { $in: [true, null] } };
    // PIPELINE AGGREGATE
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          ...(disabled ?? {}),
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $ne: ['$target', null] },
              then: '$target',
              else: '$targetID',
            },
          },
          shortcuts: {
            $push: {
              _id: '$_id',
              name: '$name',
              icon: '$icon',
              color: '$color',
              background: '$background',
              disabled: '$disabled',
              type: '$type',
              target: '$target',
              targetID: '$targetID',
              cards: '$cards',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              deletedAt: '$deletedAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          target: '$_id',
          shortcuts: 1,
        },
      },
    ];

    return await this.shortcutsModel.aggregate(pipeline);
  }

  // GET ALL SHORTCUTS GROUP BY TARGET ID
  async findShortcutsGroupByTargetId(
    targetID: Types.ObjectId,
    findAll: boolean = false,
  ): Promise<ShortcutsGroupByTarget[]> {
    const disabled = findAll ? null : { disabled: { $in: [true, null] } };
    // PIPELINE AGGREGATE
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          ...(disabled ?? {}),
        },
      },
      {
        $lookup: {
          from: 'targets',
          localField: 'targetID',
          foreignField: '_id',
          as: 'targetID',
        },
      },
      {
        $unwind: '$targetID',
      },
      {
        $group: {
          _id: '$targetID',
          shortcuts: {
            $push: {
              _id: '$_id',
              name: '$name',
              icon: '$icon',
              color: '$color',
              background: '$background',
              disabled: '$disabled',
              type: '$type',
              cards: '$cards',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              deletedAt: '$deletedAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          targetID: '$_id',
          shortcuts: 1,
        },
      },
    ];

    return await this.shortcutsModel.aggregate(pipeline);
  }

  // UPLOAD SHORTCUTS CARDS
  async uploadCardsShortcuts(
    shortcuts: CreateShortcutsDto,
    shortcutsID: Types.ObjectId,
  ) {
    // UPLOAD CARDS
    const cards = await Promise.all(
      shortcuts.cards.map(async (card: CardShortcutInputCreate) => {
        // CREATE ID SECTION
        const _id: any = new Types.ObjectId();

        const pictureImageDetail = await getImageDetail(
          _id,
          null,
          card.pictureImageDetail,
          'shortcuts',
          async () => await this.removeFiles(_id),
          'create',
        );

        const finalCard = {
          // SET ALL DATA DTO
          ...card,

          // SET ID
          _id,

          // SET PICTURE UPLOAD
          picture: null,
          pictureImageDetail,
        };

        // RETURN SHORTCUTS
        return finalCard;
      }),
    );

    // RETURN CARDS
    return cards;
  }

  // FIND SHORTCUTS
  async findShortcuts(): Promise<Shortcuts[]> {
    return await this.shortcutsModel.find({ deletedAt: null });
  }

  // FIND SHORTCUTS BY ID
  async findShortcutById(shortcutID: Types.ObjectId): Promise<Shortcuts> {
    return await this.shortcutsModel.findById(shortcutID);
  }

  // FIND SHORTCUTS BY TARGET
  async findShortcutsByTarget(target: string): Promise<Shortcuts[]> {
    return await this.shortcutsModel.find({ target: target, deletedAt: null });
  }

  // FIND SHORTCUTS BY TARGET ID
  async findShortcutsByTargetId(
    targetId: Types.ObjectId,
  ): Promise<Shortcuts[]> {
    return await this.shortcutsModel.find({
      targetID: targetId,
      deletedAt: null,
    });
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadFileSection(
    flag: string,
    fileSection: any,
    shortcutsID: Types.ObjectId,
    itemID?: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFilesItem(shortcutsID, itemID));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(fileSection, shortcutsID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, shortcutsID: Types.ObjectId) {
    const createParams = {
      filepath: 'shortcuts',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: shortcutsID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE ITEMS BUCKET
  async removeFiles(shortcutsID: Types.ObjectId) {
    const removeObject = [];
    const shortcutsQuery = this.shortcutsModel.findById(shortcutsID);
    if (!shortcutsQuery || typeof shortcutsQuery.select !== 'function') {
      return;
    }
    const shortcuts = await shortcutsQuery.select('cards').lean();
    if (!shortcuts) {
      return;
    }

    shortcuts.cards?.forEach((card: any) => {
      if (card?.picture) {
        removeObject.push({
          Key: `${ASContainerName}${card.picture.split(ASContainerName)[1]}`,
        });
      } else if (card?.pictureImageDetail) {
        removeObject.push({
          Key: `${ASContainerName}${card.pictureImageDetail.image.split(ASContainerName)[1]}`,
        });
      }
    });

    // RETURN REMOVE FILES
    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }

  // REMOVE ITEMS BUCKET
  async removeFilesItem(shortcutsID: Types.ObjectId, itemID: Types.ObjectId) {
    const removeObject = [];
    const shortcutsQuery = this.shortcutsModel.findById(shortcutsID);
    if (!shortcutsQuery || typeof shortcutsQuery.select !== 'function') {
      return;
    }
    const shortcuts = await shortcutsQuery.select('cards').lean();
    if (!shortcuts) {
      return;
    }

    shortcuts.cards?.find((card: any) => {
      if (String(card._id) === String(itemID)) {
        if (card.picture) {
          removeObject.push({
            Key: `${ASContainerName}${card.picture.split(ASContainerName)[1]}`,
          });
        } else if (card.pictureImageDetail) {
          removeObject.push({
            Key: `${ASContainerName}${card.pictureImageDetail.image.split(ASContainerName)[1]}`,
          });
        }
      }
      return String(card._id) === String(itemID);
    });

    // RETURN REMOVE FILES
    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
