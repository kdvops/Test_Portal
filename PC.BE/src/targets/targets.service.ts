import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT TARGETS SCHEMA
import { Targets, TargetsDocument } from './schema/targets.schema';

// IMPORT TARGETS INPUT
import { CreateTargetDto } from './dto/create.target.dto';
import { UpdateTargetDto } from './dto/update.target.dto';
import { TargetsList } from './dto/args.target.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import {
  SectionInputCreate,
  SectionInputUpdate,
  SectionType,
} from 'src/common/types/sections.type';
// import { TargetParentCategories as TargetStaticCategories } from 'src/common/enums/target.enum';
import { UpdateSectionDto } from 'src/sections/dto/update.section.dto';

import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';

// IMPORT MOMENT
// import * as moment from 'moment';
// import { RemoveTargetsDto } from './dto/remove.target.dto';

@Injectable()
export class TargetsService {
  constructor(
    @InjectModel(Targets.name)
    private targetModel: Model<TargetsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE TARGETS
  async createTargets(createTargetDto: CreateTargetDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    // CREATE SECTIONS
    const sections = await Promise.all(
      createTargetDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN TARGETS
    return await this.targetModel.create({
      // SET ALL DATA DTO
      ...createTargetDto,

      // SET ID
      _id,

      // SET SECTIONS
      sections,
    });
  }

  // REMOVE TARGET
  async cloneTarget(targetID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingTarget = await this.findTargetById(targetID);

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingTarget.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN BUSINESS
    return await this.targetModel.create({
      ...existingTarget,
      name: existingTarget.name + ' (copia)',
      _id,
      sections,
      slug: await getUniqueSlug(existingTarget, this.targetModel),
      status: 'draft',
    });
  }

  async changeTargetStatus(
    targetID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.targetModel.findOneAndUpdate(
      { _id: targetID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE TARGET
  async removeTarget(targetID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.targetModel.findOneAndUpdate(
      { _id: targetID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // UPDATE TARGETS
  async updateTarget(updateTargetDto: UpdateTargetDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // FIND ORIGINAL TARGET SECTIONS
    const sectionOriginalTarget: { sections: SectionType[] } =
      (await this.targetModel
        .findById(updateTargetDto.targetID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalTarget.sections,
      updateTargetDto.target.sections,
    );

    removeSections.length > 0 &&
      (await Promise.all(
        removeSections.map(async (section: SectionType) => {
          const sectionRemove =
            await this.sectionsService.removeSections(section);
          // RETURN SECTIONS
          return sectionRemove;
        }),
      ));

    // UPDATE SECTIONS
    const sections = await Promise.all(
      updateTargetDto.target.sections.map(
        async (section: SectionInputUpdate) => {
          if (section._id) {
            const updateDto: UpdateSectionDto = {
              sectionID: section._id,
              section: section,
            };
            const sectionUpdate =
              await this.sectionsService.updateSections(updateDto);
            // RETURN SECTIONS
            return sectionUpdate;
          } else {
            const sectionCreate =
              await this.sectionsService.createSections(section);
            // RETURN SECTIONS
            return sectionCreate;
          }
        },
      ),
    );
    // UPDATE SECTIONS

    return await this.targetModel.findOneAndUpdate(
      { _id: updateTargetDto.targetID },
      {
        $set: updateTargetDto.target,
        sections,
        updatedAt,
      },
      { new: true },
    );
  }

  // ENCONTRAR TODOS LOS TARGETS
  async findAllTargets(findAll: boolean = false): Promise<TargetsList[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    const targets = await this.targetModel
      .find({ deletedAt: null, ...(status ?? {}) })
      .populate(['sections'])
      .lean();
    return targets as unknown as TargetsList[];
  }

  // FIND TARGET BY ID
  async findTargetById(targetID: Types.ObjectId): Promise<TargetsList> {
    return (await this.targetModel
      .findById(targetID)
      .populate(['sections'])
      .lean()) as unknown as TargetsList;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.targetModel);
  }

  // FIND TARGET BY SLUG
  async findTargetBySlug(slug: string): Promise<TargetsList> {
    return (await this.targetModel
      .findOne({ slug })
      .populate(['sections'])
      .lean()) as unknown as TargetsList;
  }

  // FIND SECTION TO REMOVE
  findRemoveItemsInArray(
    original: SectionType[],
    modify: any[],
  ): SectionType[] {
    return original.filter(
      (itemOriginal: SectionType) =>
        !modify.some(
          (itemModify: any) =>
            String(itemOriginal._id) === String(itemModify._id),
        ),
    );
  }
}
