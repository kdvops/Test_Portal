import { Model, PipelineStage, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';

// IMPORT PROMOTION SCHEMA
import { Promotions, PromotionsDocument } from './schema/promotions.schema';

// IMPORT PROMOTION INPUT
import { CreatePromotionDto } from './dto/create.promotion.dto';
import { UpdatePromotionDto } from './dto/update.promotion.dto';
import {
  PromotionByMonth,
  SearchArgs,
  ParamsByDate,
} from './dto/args.promotions.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT MOMENT
import * as moment from 'moment';
import { RemovePromotionsDto } from './dto/remove.promotion.dto';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { getUniqueSlug } from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(AzureBlobStorageService.name);
  constructor(
    @InjectModel(Promotions.name)
    private promotionModel: Model<PromotionsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // UPDATE PROMOTION
  async updatePromotions(
    updatePromotionsDto: UpdatePromotionDto,
  ): Promise<Promotions[]> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // UPDATE PROMOTIONS
    const promotions = await Promise.all(
      updatePromotionsDto.promotions.map(async (promotionDto) => {
        if (!promotionDto._id) {
          // ID FOR NEW PROMOTION
          const newPromotionId = new Types.ObjectId();

          const pictureImageDetail = await getImageDetail(
            promotionDto._id,
            promotionDto.picture,
            promotionDto.pictureImageDetail,
            'promotions',
            async () => await this.removeFiles(promotionDto._id),
          );

          // CREATE NEW PROFIT
          const newPromotion = await this.promotionModel.create({
            // SET ALL DATA DTO
            ...promotionDto,

            // SET ID
            _id: newPromotionId,

            // SET PICTURE UPLOAD
            picture: null,
            pictureImageDetail,
          });

          // RETURN NEW PROFIT CREATED
          return newPromotion;
        } else {
          // SET NEW IMAGES
          const pictureImageDetail = await getImageDetail(
            promotionDto._id,
            promotionDto.picture,
            promotionDto.pictureImageDetail,
            'promotions',
            async () => await this.removeFiles(promotionDto._id),
          );

          const { _id: promoId, ...toUpdateData } = promotionDto;
          const updatePromotion = await this.promotionModel.findOneAndUpdate(
            { _id: new Types.ObjectId(String(promoId)) },
            {
              $set: {
                ...toUpdateData,
                picture: null,
                pictureImageDetail,
                updatedAt,
              },
            },
            { new: true },
          );

          // RETURN PROMOTION
          return updatePromotion;
        }
      }),
    );

    // RETURN PROMOTIONS
    return promotions.filter((p) => p !== null);
  }

  // CREATE PROMOTION
  async createPromotions(
    createPromotionsDto: CreatePromotionDto,
  ): Promise<Promotions[]> {
    const promotions = await Promise.all(
      createPromotionsDto.promotions.map(async (promotionDto) => {
        // CREATE ID PROMOTION
        const _id: any = new Types.ObjectId();

        // SET NEW IMAGES
        const pictureImageDetail = await getImageDetail(
          _id,
          promotionDto.picture[0]?.img,
          promotionDto.pictureImageDetail,
          'promotions',
          async () => await this.removeFiles(_id),
          'create',
        );

        const promotion = await this.promotionModel.create({
          // SET ALL DATA DTO
          ...promotionDto,

          // SET ID
          _id,

          // SET PICTURE UPLOAD
          picture: null,
          pictureImageDetail,
        });

        // RETURN PROMOTION
        return promotion;
      }),
    );

    // RETURN PROMOTIONS
    return promotions;
  }

  // CREATE PROMOTION
  async clonePromotion(promotionID: Types.ObjectId): Promise<Promotions> {
    // CREATE ID PROMOTION
    const _id: any = new Types.ObjectId();
    const existingPromotion = (
      await this.findPromotionById(promotionID)
    ).toObject();

    const pictureImageDetail = existingPromotion.pictureImageDetail
      ? {
          ...existingPromotion.pictureImageDetail,
          image: await cloneFiles(
            existingPromotion.picture ??
              existingPromotion.pictureImageDetail.image,
            String(_id),
            'promotions',
          ),
        }
      : null;

    const promotion = await this.promotionModel.create({
      // SET ALL DATA DTO
      ...existingPromotion,
      name: existingPromotion.name + ' (copia)',
      // SET ID
      _id,
      // SET PICTURE UPLOAD
      picture: null,
      pictureImageDetail,
      slug: await getUniqueSlug(existingPromotion, this.promotionModel),
      status: 'draft',
    });

    // RETURN PROMOTION
    return promotion;
  }

  // GET ALL PROMOTIONS
  async findPromotionsByMonth(
    searchArgs: SearchArgs,
    findAll: boolean = false,
  ): Promise<PromotionByMonth[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // ARGS SEARCH BY MONTH
    const month = searchArgs.month;

    // CREATE PIPELINE AGGREGATE
    const pipeline: PipelineStage[] = [
      {
        $match: { deletedAt: null, ...(status ?? {}) },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$date.start',
              timezone: 'America/Santo_Domingo',
            },
          },
          promotions: {
            $push: {
              _id: '$_id',
              name: '$name',
              percent: '$percent',
              devolution: '$devolution',
              condition: '$condition',
              extract: '$extract',
              disabled: '$disabled',
              picture: '$picture',
              pictureImageDetail: '$pictureImageDetail',
              date: '$date',
              createdAt: '$createdAt',
              deletedAt: '$deletedAt',
              status: '$status',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          promotions: 1,
          createdAt: '$_id',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: month ? { createdAt: month } : {},
      },
    ];

    // RETURN PROMOTIONS
    return await this.promotionModel.aggregate(pipeline);
  }

  // GET PROMOTION BY ID
  async findPromotionById(promotionID: Types.ObjectId): Promise<Promotions> {
    return await this.promotionModel.findById(promotionID);
  }

  // GET PROMOTION BY DATE
  async findPromotionsByDate(
    paramsByDate: ParamsByDate,
    findAll: boolean = false,
  ): Promise<Promotions[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    const startDate = moment(paramsByDate.start).startOf('day').toDate();
    const endDate = moment(paramsByDate.end).endOf('day').toDate();
    const todayStart = moment().utcOffset(-240).startOf('day').toDate();
    const todayEnd = moment().utcOffset(-240).endOf('day').toDate();

    // CREATE PIPELINE MATCH
    let match = [];

    // CREATE PIPELINE MATCHES
    const matches = [];

    // CREATE MATCH SEARCH
    const paramSearch = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$name',
          },
          regex: paramsByDate.search,
          options: 'i',
        },
      },
    };

    // SET RANGE AGGREGATE TO MONTH PROMOTIONS
    const dateRangePromotions = {
      $or: [
        {
          $and: [
            { 'date.start': { $gte: startDate } },
            { 'date.end': { $lte: endDate } },
          ],
        },
        {
          $and: [
            { 'date.start': { $lte: startDate } },
            { 'date.end': { $gte: endDate } },
          ],
        },
      ],
    };

    paramsByDate.start &&
    paramsByDate.start !== null &&
    paramsByDate.end &&
    paramsByDate.end !== null
      ? matches.push(dateRangePromotions)
      : [];

    // CREATE PIPELINE MATCH PROMOTIONS RANGE
    match = [
      {
        $and: [...matches, paramSearch],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline: PipelineStage[] = [
      {
        $match: {
          deletedAt: null,
          $or: [...match],
          ...(status ?? {}),
        },
      },
      {
        $addFields: {
          isToday: {
            $cond: [
              {
                $and: [
                  { $gte: ['$date.end', todayStart] },
                  { $lte: ['$date.end', todayEnd] },
                ],
              },
              1,
              0,
            ],
          },
          isStartToday: {
            $cond: [
              {
                $and: [
                  { $gte: ['$date.start', todayStart] },
                  { $lte: ['$date.start', todayEnd] },
                ],
              },
              1,
              0,
            ],
          },
          isPast: {
            $cond: [{ $lt: ['$date.end', todayStart] }, 1, 0],
          },
        },
      },
      {
        $sort: { isPast: 1, isToday: -1, isStartToday: -1, 'date.end': 1 },
      },
    ];

    // AGGREGATE
    return await this.promotionModel.aggregate(pipeline);
  }

  async changePromotionStatus(
    promotionID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.promotionModel.findOneAndUpdate(
      { _id: promotionID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE PROMOTION BY ID
  async removePromotion(promotionID: Types.ObjectId): Promise<Promotions> {
    // REMOVE PROMOTION DATE
    const deletedAt: Date = new Date();

    return await this.promotionModel.findOneAndUpdate(
      { _id: promotionID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // REMOVE PROMOTION BY ID
  async removePromotions(
    removePromotionsDto: RemovePromotionsDto,
  ): Promise<Promotions[]> {
    const promotions = await Promise.all(
      removePromotionsDto.promotionsIDS.map(
        async (promotionID: Types.ObjectId) => {
          // REMOVE IMAGE
          await this.removeFiles(promotionID);

          // REMOVE PROMOTION DATE
          const deletedAt: Date = new Date();

          // SET EMPTY STRING TO PICTURE
          const picture: string = '';

          return await this.promotionModel.findOneAndUpdate(
            { _id: promotionID },
            { $set: { deletedAt, picture } },
            { new: true },
          );
        },
      ),
    );

    // RETURN PROMOTIONS
    return promotions;
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImagePromotion(
    flag: string,
    imagePromotion: any,
    promotionID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(promotionID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imagePromotion, promotionID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, promotionID: Types.ObjectId) {
    const createParams = {
      filepath: 'promotions',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: promotionID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(promotionID: Types.ObjectId) {
    const removeObject = [];
    const promotionQuery = this.promotionModel.findById(promotionID);
    if (!promotionQuery || typeof promotionQuery.select !== 'function') {
      return;
    }
    const promotion = await promotionQuery
      .select('picture pictureImageDetail')
      .lean();
    if (!promotion) {
      return;
    }

    if (promotion.picture) {
      removeObject.push({
        Key: `${ASContainerName}${promotion.picture.split(ASContainerName)[1]}`,
      });
    } else if (promotion.pictureImageDetail?.image) {
      removeObject.push({
        Key: `${ASContainerName}${promotion.pictureImageDetail.image.split(ASContainerName)[1]}`,
      });
    }

    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
