import { Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyBulkWriteOperation } from 'mongodb';

// IMPORT SLIDER SCHEMA
import { Sliders, SlidersDocument } from './schema/sliders.schema';

// IMPORT SLIDER INPUT
import { CreateSliderDto } from './dto/create.slider.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName, ImageCompression } from 'src/common/constants';
import { getUploadedImageUrl, isBase64 } from 'src/common/utils/imageManager';
import {
  ImageDetailInput,
  ImageDetailInputUpdate,
} from 'src/common/types/common.type';
import { UpdateSlider } from './dto/update.slider.dto';
import { UpdatePositionsSliderDto } from './dto/update-positions.slider.dto';

@Injectable()
export class SlidersService {
  private readonly logger = new Logger(SlidersService.name);
  constructor(
    @InjectModel(Sliders.name)
    private sliderModel: Model<SlidersDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  async getImageUrl(source, sectionId, type, flag) {
    const url =
      (await isBase64(source)) === true
        ? await getUploadedImageUrl(
            'sliders',
            async () => await this.removeFiles(sectionId, type),
            flag,
            source,
            sectionId,
          )
        : (source ?? null);
    return url;
  }
  async getImageDetail(
    _id: Types.ObjectId,
    image: string,
    imageDetail: ImageDetailInput | ImageDetailInputUpdate,
    target: string,
    action: string = 'update',
  ) {
    const isImageDetailEmpty =
      !imageDetail?.image || imageDetail.image.trim() === '';
    const isImageEmpty = !image || image.trim() === '';
    if (isImageDetailEmpty && isImageEmpty) {
      return null;
    }
    const imageUrl = async () => {
      const imgUrl = await this.getImageUrl(
        imageDetail.image,
        _id,
        target,
        action,
      );
      return imgUrl;
    };
    const imageDetailed = {
      ...imageDetail,
      image: !isImageDetailEmpty ? await imageUrl() : image,
    };
    return imageDetailed;
  }

  // UPDATE SLIDER
  async updateSliders(updateSlidersDto: UpdateSlider): Promise<any> {
    const updatedAt = Date.now();

    const pictureImageDetail = await this.getImageDetail(
      updateSlidersDto._id,
      updateSlidersDto.picture,
      updateSlidersDto.pictureImageDetail,
      'pictureImageDetail',
    );

    const responsiveImageDetail = await this.getImageDetail(
      updateSlidersDto._id,
      updateSlidersDto.responsive,
      updateSlidersDto.responsiveImageDetail,
      'responsiveImageDetail',
    );

    return await this.sliderModel.findOneAndUpdate(
      { _id: updateSlidersDto._id },
      {
        $set: updateSlidersDto,
        picture: null,
        responsive: null,
        pictureImageDetail,
        responsiveImageDetail,
        updatedAt,
      },
      { new: true },
    );
  }

  // CREATE SLIDER
  async createSliders(createSlidersDto: CreateSliderDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const pictureImageDetail = await this.getImageDetail(
      _id,
      null,
      createSlidersDto.responsiveImageDetail,
      'pictureImageDetail',
      'create',
    );

    const responsiveImageDetail = await this.getImageDetail(
      _id,
      null,
      createSlidersDto.responsiveImageDetail,
      'responsiveImageDetail',
      'create',
    );

    return this.sliderModel.create({
      // DTO PAYLOAD
      ...createSlidersDto,
      // SET VALUES FOR SLIDER
      _id,
      picture: null,
      responsive: null,
      pictureImageDetail,
      responsiveImageDetail,
    });
  }

  // GET ALL SLIDERS
  async sliders(): Promise<Sliders[]> {
    return await this.sliderModel.find({ deletedAt: null });
  }

  // GET SLIDER BY ID
  async findSliderById(sliderID: Types.ObjectId): Promise<Sliders> {
    return await this.sliderModel.findById(sliderID);
  }

  // GET SLIDER BY TARGET
  async findSlidersByTarget(target: string): Promise<Sliders[]> {
    return await this.sliderModel.find({ target: target, deletedAt: null });
  }

  // GET SLIDER BY TARGET ID
  async findSliderByTargetId(targetID: string): Promise<Sliders[]> {
    return await this.sliderModel.find({ targetID: targetID, deletedAt: null });
  }

  // UPDATE SLIDERS POSITIONS
  async updateSlidersPositions(
    updatePositionsDto: UpdatePositionsSliderDto,
  ): Promise<Sliders[]> {
    const updatedAt = Date.now();
    const bulkOps = updatePositionsDto.sliders.map((slider) => ({
      updateOne: {
        filter: { _id: slider.id },
        update: {
          $set: {
            position: slider.position,
            updatedAt,
          },
        },
      },
    })) as unknown as AnyBulkWriteOperation<SlidersDocument>[];

    await this.sliderModel.bulkWrite(bulkOps);

    // RETORNAR LOS SLIDERS ACTUALIZADOS
    const sliderIds = updatePositionsDto.sliders.map((s) => s.id);
    return await this.sliderModel.find({
      _id: { $in: sliderIds },
      deletedAt: null,
    });
  }

  // REMOVE SLIDER BY ID
  async removeSliders(sliderID: Types.ObjectId): Promise<any> {
    // REMOVE IMAGE
    await this.removeFiles(sliderID, 'picture');
    await this.removeFiles(sliderID, 'responsive');

    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    // SET EMPTY STRING TO PICTURE
    //const picture: string = '';

    return await this.sliderModel.findOneAndUpdate(
      { _id: sliderID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageSlider(
    flag: string,
    imageSlider: any,
    sliderID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(sliderID, target));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageSlider, sliderID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, sliderID: Types.ObjectId) {
    const createParams = {
      filepath: 'sliders',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: sliderID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(sliderID: Types.ObjectId, type: string) {
    const removeObject = [];
    const sliderQuery = this.sliderModel.findById(sliderID);
    if (!sliderQuery || typeof sliderQuery.select !== 'function') {
      return;
    }
    const slider = await sliderQuery.select(type).lean();
    if (!slider) {
      return;
    }

    if (!type.includes('ImageDetail') && slider[type]) {
      removeObject.push({
        Key: `${ASContainerName}${slider[type].split(ASContainerName)[1]}`,
      });
    } else if (type.includes('ImageDetail') && slider[type]?.image) {
      removeObject.push({
        Key: `${ASContainerName}${slider[type].image.split(ASContainerName)[1]}`,
      });
    }

    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
