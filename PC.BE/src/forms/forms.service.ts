import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT INSURANCE SCHEMA
import { Forms, FormsDocument } from './schema/forms.schema';

// IMPORT INSURANCE INPUT
import { CreateFormsDto } from './dto/create.forms.dto';
import { UpdateFormsDto } from './dto/update.forms.dto';
import { FormsType } from './dto/args.forms.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Forms.name)
    private formsModel: Model<FormsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // CREATE INSURANCE
  async createForms(createFormsDto: CreateFormsDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createFormsDto.bannerImageDetail,
      'forms',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createFormsDto.responsiveImageDetail,
      'forms',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // ADD IDS INPUTS FORMS
    const inputsForms = createFormsDto.inputs.map((input: any) => {
      // CREATE ID
      const _idInput: any = new Types.ObjectId();
      return {
        ...input,
        _id: _idInput,
      };
    });

    // RETURN INSURANCE
    return await this.formsModel.create({
      // SET ALL DATA DTO
      ...createFormsDto,
      // SET ID
      _id,
      // SET INPUTS
      inputs: inputsForms,
      // SET PICTURE UPLOAD
      banner: null,
      // SET RESPONSIVE UPLOAD
      responsive: null,
      bannerImageDetail,
      responsiveImageDetail,
    });
  }

  // UPDATE INSURANCE
  async updateForms(updateFormsDto: UpdateFormsDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateFormsDto.formsID,
      updateFormsDto.forms.banner,
      updateFormsDto.forms.bannerImageDetail,
      'forms',
      async () =>
        await this.removeFiles(updateFormsDto.formsID, 'bannerImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateFormsDto.formsID,
      updateFormsDto.forms.responsive,
      updateFormsDto.forms.responsiveImageDetail,
      'forms',
      async () =>
        await this.removeFiles(updateFormsDto.formsID, 'responsiveImageDetail'),
    );

    // ADD IDS INPUTS FORMS
    const inputsForms = updateFormsDto.forms.inputs.map((input: any) => {
      // CREATE ID
      const _idInput: any = new Types.ObjectId();
      if (input && !input._id) {
        return {
          ...input,
          _id: _idInput,
        };
      } else {
        return {
          ...input,
          _id: input._id,
        };
      }
    });

    return this.formsModel.findOneAndUpdate(
      { _id: updateFormsDto.formsID },
      {
        $set: updateFormsDto.forms,
        banner: null,
        responsive: null,
        bannerImageDetail,
        responsiveImageDetail,
        inputs: inputsForms,
        updatedAt,
      },
      { new: true },
    );
  }

  // CLONE FORMS
  async cloneForms(formsID: string): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const forms: FormsType = await this.findFormsById(formsID);

    const banner = await cloneFiles(forms.banner, formsID);

    const responsive = forms.responsive
      ? await cloneFiles(forms.responsive, formsID)
      : null;

    // ADD IDS INPUTS FORMS
    const inputsForms = forms.inputs.map((input: any) => {
      // CREATE ID
      const _idInput: any = new Types.ObjectId();
      return {
        ...input,
        _id: _idInput,
      };
    });

    // RETURN INSURANCE
    return await this.formsModel.create({
      // SET ALL DATA DTO
      ...forms,
      title: forms.title + ' (copia)',
      // SET ID
      _id,
      // SET INPUTS
      inputs: inputsForms,
      // SET PICTURE UPLOAD
      banner,
      // SET RESPONSIVE UPLOAD
      responsive,
      // NEW SLUG
      slug: await getUniqueSlug(forms, this.formsModel),
      status: 'draft',
    });
  }

  async changeFormsStatus(
    formID: string,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.formsModel.findOneAndUpdate(
      { _id: formID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE INSURANCE
  async removeForms(formID: string): Promise<any> {
    // REMOVE PROFIT DATE
    const deletedAt: Date = new Date();

    return await this.formsModel.findOneAndUpdate(
      { _id: formID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND INSURANCE BY ID
  async findFormsById(formsID: string): Promise<FormsType> {
    let form: FormsType | null = null;

    // Convertir el ID a ObjectId si es válido
    if (Types.ObjectId.isValid(formsID)) {
      const objectId = new Types.ObjectId(formsID);
      form = (await this.formsModel
        .findOne({ _id: objectId, deletedAt: null })
        .lean()) as unknown as FormsType;
    }

    // Si no se encontró, lanzar error
    if (!form) {
      throw new Error(`Form with ID ${formsID} not found`);
    }

    return form;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.formsModel);
  }

  // FIND FORM BY SLUG
  async findFormsBySlug(slug: string): Promise<FormsType> {
    const form = await this.formsModel
      .findOne({ slug, deletedAt: null })
      .lean();

    if (!form) {
      throw new Error(`Form with slug ${slug} not found`);
    }

    return form as unknown as FormsType;
  }

  // FIND INSURANCE
  async findForms(): Promise<FormsType[]> {
    return await this.formsModel.find({ deletedAt: null });
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageForms(
    flag: string,
    imageForms: any,
    formsID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(formsID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageForms, formsID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, formsID: Types.ObjectId) {
    const createParams = {
      filepath: 'forms',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: formsID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(formsID: Types.ObjectId, type: string) {
    const removeObject = [];
    const forms = await this.formsModel
      .findById(formsID)
      .select(type)
      .lean();

    if (forms && forms[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${forms[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && forms[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${forms[type].image.split(ASContainerName)[1]}`,
        });
      }
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }
}
