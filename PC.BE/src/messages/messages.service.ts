import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT MESSAGES SCHEMA
import { Messages, MessagesDocument } from './schema/messages.schema';

// IMPORT MESSAGES INPUT
import { CreateMessagesDto } from './dto/create.messages.dto';
import { UpdateMessagesDto } from './dto/update.messages.dto';
import { ArgsMessages, MessagesPostType } from './dto/args.messages.dto';

// IMPORT MOMENT
import * as moment from 'moment';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Messages.name)
    private messagesModel: Model<MessagesDocument>,
  ) {}

  // CREATE MESSAGES
  async createMessages(createMessagesDto: CreateMessagesDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    // RETURN MESSAGES
    return await this.messagesModel.create({
      // SET ALL DATA DTO
      ...createMessagesDto,

      // SET ID
      _id,
    });
  }

  // UPDATE MESSAGES
  async updateMessages(updateMessagesDto: UpdateMessagesDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    return await this.messagesModel.findOneAndUpdate(
      { _id: updateMessagesDto.messagesID },
      {
        $set: updateMessagesDto.messages,
        updatedAt,
      },
      { new: true },
    );
  }

  // UPDATE MESSAGES
  async removeMessages(messagesID: Types.ObjectId): Promise<any> {
    console.log('messagesID', messagesID);
    // FIND ORIGINAL MESSAGES SECTIONS
    // const sectionOriginalMessages: { sections: SectionType[] } =
    //   await this.messagesModel
    //     .findById(updateMessagesDto.messagesID)
    //     .populate(['sections'])
    //     .select('sections')
    //     .lean();
    // FIND REMOVE SECTIONS
    // const removeSections = this.findRemoveItemsInArray(
    //   sectionOriginalMessages.sections,
    //   updateMessagesDto.messages.sections,
    // );
    // removeSections.length > 0 &&
    //   (await Promise.all(
    //     removeSections.map(async (section: SectionType) => {
    //       const sectionRemove =
    //         await this.sectionsService.removeSections(section);
    //       // RETURN SECTIONS
    //       return sectionRemove;
    //     }),
    //   ));
    // UPDATE SECTIONS
    // const sections = await Promise.all(
    //   updateMessagesDto.messages.sections.map(
    //     async (section: SectionInputUpdate) => {
    //       if (section._id) {
    //         const updateDto: UpdateSectionDto = {
    //           sectionID: section._id,
    //           section: section,
    //         };
    //         const sectionUpdate =
    //           await this.sectionsService.updateSections(updateDto);
    //         // RETURN SECTIONS
    //         return sectionUpdate._id;
    //       } else {
    //         const sectionCreate =
    //           await this.sectionsService.createSections(section);
    //         // RETURN SECTIONS
    //         return sectionCreate._id;
    //       }
    //     },
    //   ),
    // );
    // UPDATE SECTIONS
    // return this.messagesModel.findOneAndUpdate(
    //   { _id: updateMessagesDto.messagesID },
    //   {
    //     $set: updateMessagesDto.messages,
    //     banner: newBannerMessages,
    //     file: newFileMessages,
    //     sections,
    //     updatedAt,
    //   },
    //   { new: true },
    // );
  }

  // FIND MESSAGES BY ID
  async findMessagesById(
    messagesID: Types.ObjectId,
  ): Promise<MessagesPostType> {
    return (await this.messagesModel
      .findById(messagesID)
      .populate(['form'])
      .lean()) as unknown as MessagesPostType;
  }

  // FIND MESSAGES
  async findMessages(argsMessages: ArgsMessages): Promise<MessagesPostType[]> {
    // CREATE PIPELINE MATCH
    let match = [];

    // CREATE PIPELINE MATCHES
    const matches = [];

    // CREATE MATCH TYPE
    const messagesSearchRef = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$form._id',
          },
          regex: argsMessages.formRef,
          options: 'i',
        },
      },
    };

    const messagesDay = {
      createdAt: {
        $gte: moment(argsMessages.date.start).startOf('days').toDate(),
        $lte: moment(argsMessages.date.end).endOf('days').toDate(),
      },
    };

    argsMessages.formRef && argsMessages.formRef !== ''
      ? matches.push(messagesSearchRef)
      : [];

    (argsMessages.date && argsMessages.date.start !== null) ||
    (argsMessages.date && argsMessages.date.end !== null)
      ? matches.push(messagesDay)
      : [];

    match = [
      {
        $and: [...matches, messagesSearchRef],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline = [
      {
        $lookup: {
          from: 'forms',
          localField: 'form',
          foreignField: '_id',
          as: 'form',
        },
      },
      { $unwind: '$form' },
      {
        $match: {
          deletedAt: null,
          $or: [...match],
        },
      },
    ];

    // AGGREGATE
    return await this.messagesModel.aggregate(pipeline);
  }

  // FIND MESSAGES
  async findMessagesAndDownloadFile(
    argsMessages: ArgsMessages,
  ): Promise<MessagesPostType[]> {
    // CREATE PIPELINE MATCH
    let match = [];

    // CREATE PIPELINE MATCHES
    const matches = [];

    // CREATE MATCH TYPE
    const messagesSearchRef = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$form._id',
          },
          regex: argsMessages.formRef,
          options: 'i',
        },
      },
    };

    const messagesDay = {
      createdAt: {
        $gte: moment(argsMessages.date.start).startOf('day').toDate(),
        $lte: moment(argsMessages.date.end).endOf('day').toDate(),
      },
    };

    argsMessages.formRef && argsMessages.formRef !== ''
      ? matches.push(messagesSearchRef)
      : [];

    (argsMessages.date && argsMessages.date.start !== null) ||
    (argsMessages.date && argsMessages.date.end !== null)
      ? matches.push(messagesDay)
      : [];

    match = [
      {
        $and: [...matches, messagesSearchRef],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline = [
      {
        $lookup: {
          from: 'forms',
          localField: 'form',
          foreignField: '_id',
          as: 'form',
        },
      },
      { $unwind: '$form' },
      {
        $match: {
          deletedAt: null,
          $or: [...match],
        },
      },
    ];

    // AGGREGATE
    return await this.messagesModel.aggregate(pipeline);
  }
}
