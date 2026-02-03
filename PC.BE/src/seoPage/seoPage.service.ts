import { Model, Types, Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { CreateSeoPageDto, CreateSeoPagesDto } from './dto/create.seoPage.dto';
import { UpdateSeoPageDto } from './dto/update.seoPage.dto';

import { SeoPage, SeoPageDocument } from './schema/seoPage.schema';

@Injectable()
export class SeoPageService {
  constructor(
    @InjectModel(SeoPage.name)
    private seoPageModel: Model<SeoPageDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createSeoPage(createSeoPageDto: CreateSeoPageDto): Promise<SeoPage> {
    const _id: any = new Types.ObjectId();

    return this.seoPageModel.create({
      ...createSeoPageDto,
      _id,
    });
  }

  async createSeoPages(createSeoPageDto: CreateSeoPagesDto): Promise<any> {
    const _id: any = new Types.ObjectId();

    const seoPagesDto = createSeoPageDto.pages.map((seoPage) => ({
      ...seoPage,
      _id,
    }));

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.seoPageModel.insertMany(seoPagesDto, { session });
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  // UPDATE COINS
  async updateSeoPage(updateSeoPageDto: UpdateSeoPageDto): Promise<SeoPage> {
    const updatedAt = Date.now();
    const { _id, ...seoPageData } = updateSeoPageDto;

    return await this.seoPageModel.findOneAndUpdate(
      { _id },
      {
        $set: seoPageData,
        updatedAt,
      },
      { new: true },
    );
  }

  async removeSeoPage(seoPageId: Types.ObjectId): Promise<SeoPage> {
    const deletedAt: Date = new Date();

    return await this.seoPageModel.findOneAndUpdate(
      { _id: seoPageId },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  async findSeoPageById(seoPageId: Types.ObjectId): Promise<SeoPage> {
    return (await this.seoPageModel.findById(seoPageId).lean()) as unknown as SeoPage;
  }

  async findSeoPageByPath(path: string): Promise<SeoPage> {
    return (await this.seoPageModel
      .findOne({ path, deletedAt: null })
      .lean()) as unknown as SeoPage;
  }

  async seoPages(): Promise<SeoPage[]> {
    return (await this.seoPageModel
      .find({ deletedAt: null })
      .lean()) as unknown as SeoPage[];
  }
}
