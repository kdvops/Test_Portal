import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT COINS SCHEMA
import { Coins, CoinsDocument } from './schema/coins.schema';

// IMPORT COINS INPUT
import { CreateCoinDto } from './dto/create.coin.dto';
import { UpdateCoinDto } from './dto/update.coin.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { ASContainerName, ImageCompression } from 'src/common/constants';
import { getImageDetail } from 'src/common/utils/fileHandler';

@Injectable()
export class CoinsService {
  constructor(
    @InjectModel(Coins.name)
    private coinModel: Model<CoinsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // CREATE COINS
  async createCoins(createCoinDto: CreateCoinDto): Promise<Coins> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    // SET NEW IMAGES
    const logoImageDetail = await getImageDetail(
      _id,
      null,
      createCoinDto.logoImageDetail,
      'coins',
      async () => await this.removeFiles(_id),
      'create',
    );

    // RETURN COINS
    return await this.coinModel.create({
      // SET ALL DATA DTO
      ...createCoinDto,
      // SET ID
      _id,
      // SET PICTURE UPLOAD
      logo: null,
      logoImageDetail,
    });
  }

  // UPDATE COINS
  async updateCoin(updateCoinDto: UpdateCoinDto): Promise<Coins> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // SET NEW IMAGES
    const logoImageDetail = await getImageDetail(
      updateCoinDto.coinID,
      updateCoinDto.coin.logo,
      updateCoinDto.coin.logoImageDetail,
      'coins',
      async () => await this.removeFiles(updateCoinDto.coinID),
    );

    return await this.coinModel.findOneAndUpdate(
      { _id: updateCoinDto.coinID },
      {
        $set: updateCoinDto.coin,
        logo: null,
        logoImageDetail,
        updatedAt,
      },
      { new: true },
    );
  }

  // REMOVE COINS
  async removeCoin(coinID: Types.ObjectId): Promise<Coins> {
    // REMOVE IMAGE
    await this.removeFiles(coinID);

    // REMOVE EPISODE PODCAST DATE
    const deletedAt: Date = new Date();

    // SET EMPTY STRING TO PICTURE
    const logo: string = '';

    return await this.coinModel.findOneAndUpdate(
      { _id: coinID },
      { $set: { deletedAt, logo } },
      { new: true },
    );
  }

  // FIND COIN BY ID
  async findCoinById(coinID: Types.ObjectId): Promise<Coins> {
    return (await this.coinModel.findById(coinID).lean()) as unknown as Coins;
  }

  // COINS
  async coins(): Promise<Coins[]> {
    return (await this.coinModel
      .find({ deletedAt: null })
      .lean()) as unknown as Coins[];
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageCoin(
    flag: string,
    imageCoin: any,
    coinID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(coinID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageCoin, coinID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, coinID: Types.ObjectId) {
    const createParams = {
      filepath: 'coins',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: coinID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(coinID: Types.ObjectId) {
    const removeObject = [];
    const coin = await this.coinModel
      .findById(coinID)
      .select('logo')
      .lean();

    if (coin.logo) {
      removeObject.push({
        Key: `${ASContainerName}${coin.logo.split(ASContainerName)[1]}`,
      });
    } else if (coin.logoImageDetail) {
      removeObject.push({
        Key: `${ASContainerName}${coin.logoImageDetail.image.split(ASContainerName)[1]}`,
      });
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }
}
