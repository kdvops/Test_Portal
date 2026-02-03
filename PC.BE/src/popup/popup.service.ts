import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT POPUP SCHEMA
import { Popup, PopupDocument } from './schema/popup.schema';

// IMPORT POPUP INPUT
import { CreatePopupDto } from './dto/create.popup.dto';
import { UpdatePopupDto } from './dto/update.popup.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class PopupService {
  constructor(
    @InjectModel(Popup.name)
    private popupModel: Model<PopupDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // UPDATE POPUP
  async updatePopup(updatePopupDto: UpdatePopupDto): Promise<Popup[]> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // SET NEW IMAGES
    const picturePopup =
      updatePopupDto.newImagePopup &&
      updatePopupDto.newImagePopup[0] &&
      updatePopupDto.newImagePopup[0].img &&
      updatePopupDto.newImagePopup[0].filetype
        ? await this.checkUploadImagePopup(
            'update',
            updatePopupDto.newImagePopup,
            updatePopupDto.popupID,
          )
        : updatePopupDto.popup.image;
    // SET NEW IMAGE

    // RETURN POPUPS
    return await this.popupModel.findOneAndUpdate(
      { _id: updatePopupDto.popupID },
      {
        $set: updatePopupDto.popup,
        image: picturePopup,
        updatedAt,
      },
      { new: true },
    );
  }

  // ACTIVE POPUP
  async activePopup(popupID: Types.ObjectId): Promise<Popup> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // VALIDATE POPUPS ACTIVE OLDER
    const getPopupsActive = await this.popupModel.find({ active: true });

    // SET POPUPS OLDER ACTIVE FALSE
    await Promise.all(
      getPopupsActive.map(async (popup: Popup) => {
        const popupUpdateActive = await this.popupModel.findOneAndUpdate(
          { _id: popup._id },
          {
            $set: { active: false },
            updatedAt,
          },
          { new: true },
        );

        return popupUpdateActive;
      }),
    );

    // RETURN POPUPS
    return await this.popupModel.findOneAndUpdate(
      { _id: popupID },
      {
        $set: { active: true },
        updatedAt,
      },
      { new: true },
    );
  }

  // CREATE POPUP
  async createPopup(createPopupDto: CreatePopupDto): Promise<Popup> {
    // CREATE ID POPUP
    const _id: any = new Types.ObjectId();

    // SET NEW IMAGES
    const picturePopup =
      createPopupDto.image &&
      createPopupDto.image[0] &&
      createPopupDto.image[0].img &&
      createPopupDto.image[0].filetype
        ? await this.checkUploadImagePopup('create', createPopupDto.image, _id)
        : '';
    // SET NEW IMAGES

    // RETURN POPUP
    return await this.popupModel.create({
      // SET ALL DATA DTO
      ...createPopupDto,

      // SET ID
      _id,

      // SET COVER UPLOAD
      image: picturePopup,
    });
  }

  // GET POPUP BY ACTIVE
  async findPopupByActive(): Promise<Popup> {
    return await this.popupModel.findOne({ active: true, deletedAt: null });
  }

  // GET POPUP BY ID
  async findPopups(): Promise<Popup[]> {
    return await this.popupModel.find({ deletedAt: null });
  }

  // GET POPUP BY ID
  async findPopupById(popupID: Types.ObjectId): Promise<Popup> {
    return await this.popupModel.findById(popupID);
  }

  // REMOVE POPUP BY ID
  async removePopup(popupID: Types.ObjectId): Promise<Popup> {
    // REMOVE POPUP DATE
    const deletedAt: Date = new Date();

    return await this.popupModel.findOneAndUpdate(
      { _id: popupID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImagePopup(
    flag: string,
    imagePopup: any,
    popupID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(popupID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imagePopup, popupID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, popupID: Types.ObjectId) {
    const createParams = {
      filepath: 'popup',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: popupID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(popupID: Types.ObjectId) {
    const removeObject = [];
    const popupQuery = this.popupModel.findById(popupID);
    if (!popupQuery || typeof popupQuery.select !== 'function') {
      return;
    }
    const popup = await popupQuery.select('image').lean();
    if (!popup?.image) {
      return;
    }

    removeObject.push({
      Key: `${ASContainerName}${popup.image.split(ASContainerName)[1]}`,
    });

    return await this.azureBlobStorageService.remove(removeObject);
  }
}
