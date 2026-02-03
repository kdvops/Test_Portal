import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { parseStringPromise } from 'xml2js';
// import * as _ from 'lodash';

// IMPORT PROUSER SCHEMA
import { Prouser, ProuserDocument } from './schema/prouser.schema';

// IMPORT PROUSER INPUT
import { CreateProuserDto } from './dto/create.prouser.dto';
import { UpdateProuserDto } from './dto/update.prouser.dto';
import {
  ArgsProuser,
  ProuserByGroupType,
  ProuserPostType,
  ProuserValidateDocumentType,
} from './dto/args.prouser.dto';
import { UpdateSectionDto } from 'src/sections/dto/update.section.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { HttpService } from '@nestjs/axios';
import {
  SectionInputCreate,
  SectionInputUpdate,
  SectionType,
} from 'src/common/types/sections.type';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class ProuserService {
  constructor(
    @InjectModel(Prouser.name)
    private prouserModel: Model<ProuserDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
    private readonly httpService: HttpService,
  ) {}

  // CREATE PROUSER
  async createProuser(createProuserDto: CreateProuserDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    // SET NEW IMAGES
    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createProuserDto.bannerImageDetail,
      'prouser',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createProuserDto.thumbnailImageDetail,
      'prouser',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createProuserDto.responsiveImageDetail,
      'prouser',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createProuserDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN PROUSER
    return await this.prouserModel.create({
      // SET ALL DATA DTO
      ...createProuserDto,

      // SET ID
      _id,

      // SET PICTURE UPLOAD
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,
      // SET SECTIONS
      sections,
    });
  }

  // UPDATE PROUSER
  async updateProuser(updateProuserDto: UpdateProuserDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateProuserDto.prouserID,
      updateProuserDto.prouser.banner,
      updateProuserDto.prouser.bannerImageDetail,
      'prouser',
      async () =>
        await this.removeFiles(updateProuserDto.prouserID, 'bannerImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateProuserDto.prouserID,
      updateProuserDto.prouser.thumbnail,
      updateProuserDto.prouser.thumbnailImageDetail,
      'prouser',
      async () =>
        await this.removeFiles(
          updateProuserDto.prouserID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateProuserDto.prouserID,
      updateProuserDto.prouser.responsive,
      updateProuserDto.prouser.responsiveImageDetail,
      'prouser',
      async () =>
        await this.removeFiles(
          updateProuserDto.prouserID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL PROUSER SECTIONS
    const sectionOriginalProuser: { sections: SectionType[] } =
      (await this.prouserModel
        .findById(updateProuserDto.prouserID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalProuser.sections,
      updateProuserDto.prouser.sections,
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
      updateProuserDto.prouser.sections.map(
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

    return await this.prouserModel.findOneAndUpdate(
      { _id: updateProuserDto.prouserID },
      {
        $set: updateProuserDto.prouser,
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail,
        thumbnailImageDetail,
        responsiveImageDetail,
        sections,
        updatedAt,
      },
      { new: true },
    );
  }

  // CLONE PROUSER
  async cloneProuser(prouserID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingProuser = await this.findProuserById(prouserID);

    const banner = await cloneFiles(
      existingProuser.banner,
      String(_id),
      'prouser',
    );

    const responsive = await cloneFiles(
      existingProuser.responsive,
      String(_id),
      'prouser',
    );

    const thumbnail = await cloneFiles(
      existingProuser.thumbnail,
      String(_id),
      'prouser',
    );

    const bannerImageDetail = existingProuser.bannerImageDetail
      ? {
          ...existingProuser.bannerImageDetail,
          image: existingProuser.bannerImageDetail
            ? await cloneFiles(
                existingProuser.bannerImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = existingProuser.responsiveImageDetail
      ? {
          ...existingProuser.responsiveImageDetail,
          image: existingProuser.responsiveImageDetail
            ? await cloneFiles(
                existingProuser.responsiveImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = existingProuser.thumbnailImageDetail
      ? {
          ...existingProuser.thumbnailImageDetail,
          image: existingProuser.thumbnailImageDetail
            ? await cloneFiles(
                existingProuser.thumbnailImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingProuser.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN PROUSER
    return await this.prouserModel.create({
      ...existingProuser,
      title: existingProuser.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingProuser, this.prouserModel),
      status: 'draft',
    });
  }

  async changeProuserStatus(
    prouserID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.prouserModel.findOneAndUpdate(
      { _id: prouserID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE PROUSER
  async removeProuser(prouserID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.prouserModel.findOneAndUpdate(
      { _id: prouserID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND PROUSER BY TYPE
  async findProuserValidationDocument(
    documentNumber: string,
  ): Promise<ProuserValidateDocumentType> {
    const soapXML = `<?xml version="1.0" encoding="utf-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
        <soapenv:Header/>
        <soapenv:Body>
            <tem:Execute>
                <tem:xmlin>
                <![CDATA[
                    <ExtremeMsg>
                        <Header>
                            <HField name="MsgType" Value="0"/>
                            <HField name="TranType" Value="1"/>
                            <HField name="RealDate" Value="20201028"/>
                            <HField name="BussDate" Value="20201028"/>
                            <HField name="Company" Value="1"/>
                            <HField name="Canal" Value="B2000"/>
                            <HField name="TrnCode" Value="6400"/>
                            <HField name="SerialTrn" Value="20201028"/>
                        </Header>
                        <Data>
                          <DField Type="P" name="pNumSec" Value="${documentNumber}" />
                        </Data>
                    </ExtremeMsg>
                  ]]>
          </tem:xmlin>
          </tem:Execute>
          </soapenv:Body>
          </soapenv:Envelope>`;
    const headers = {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://tempuri.org/MDS/Execute',
      },
    };
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(
          process.env.CONNECTION_EXTREME_MEDIATOR_SERVICE,
          soapXML,
          headers,
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    const dataXML = await parseStringPromise(data, { explicitArray: false });
    const XML = dataXML['s:Envelope']['s:Body'].ExecuteResponse.ExecuteResult;

    const dataJSON = await parseStringPromise(XML, {
      explicitArray: true,
      compact: true,
      spaces: 4,
    });

    const finalData = dataJSON.ExtremeMsgReply.Data[0].DField[2]['$']['Value'];

    const finalDataParse = JSON.parse(finalData)[0];

    if (!finalDataParse) {
      throw new Error('El Documento que esta solicitando no existe!');
    }

    return finalDataParse;
  }

  // FIND PROUSER BY TYPE
  async findProuserByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<ProuserPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.prouserModel
      .find({
        category: category,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as ProuserPostType[];
  }

  // FIND GROUP PROUSER
  async findProuserGroupByType(
    findAll: boolean = false,
  ): Promise<ProuserByGroupType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // CREATE PIPELINE
    const pipeline = [
      {
        $match: { deletedAt: null, ...(status ?? {}) },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $group: {
          _id: '$category',
          category: {
            $first: {
              _id: '$category._id',
              name: '$category.name',
              pictures: '$category.pictures',
              parentTarget: '$category.parentTarget',
              target: '$category.target',
            },
          },
          prouser: {
            $push: {
              _id: '$_id',
              title: '$title',
              subtitle: '$subtitle',
              slug: '$slug',
              excerpt: '$excerpt',
              link: '$link',
              description: '$description',
              banner: '$banner',
              thumbnail: '$thumbnail',
              responsive: '$responsive',
              bannerImageDetail: '$bannerImageDetail',
              responsiveImageDetail: '$responsiveImageDetail',
              thumbnailImageDetail: '$thumbnailImageDetail',
              category: '$category',
              disabled: '$disabled',
              deletedAt: '$deletedAt',
              status: '$status',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          prouser: 1,
        },
      },
    ];

    // RETURN PROUSER
    return await this.prouserModel.aggregate(pipeline).exec();
  }

  // FIND BUSINESS BY SLUG
  async findProuserBySlug(slug: string): Promise<ProuserPostType> {
    return (await this.prouserModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as ProuserPostType;
  }

  // FIND PROUSER BY ID
  async findProuserById(prouserID: Types.ObjectId): Promise<ProuserPostType> {
    const prouser = (await this.prouserModel
      .findOne({ _id: prouserID })
      .populate(['sections', 'category'])
      .lean()) as unknown as ProuserPostType;

    if (!prouser) {
      throw new NotFoundException(`Prouser con ID ${prouserID} no encontrado`);
    }

    return prouser;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.prouserModel);
  }

  // FIND PROUSER
  async findProuser(argsProuser: ArgsProuser): Promise<ProuserPostType[]> {
    // CREATE PIPELINE MATCH
    let match = [];

    // CREATE PIPELINE MATCHES
    const matches = [];

    // CREATE MATCH SEARCH
    const postSearch = {
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$title',
              },
              regex: argsProuser.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$subtitle',
              },
              regex: argsProuser.search,
              options: 'i',
            },
          },
        },
        ,
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$slug',
              },
              regex: argsProuser.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$excerpt',
              },
              regex: argsProuser.search,
              options: 'i',
            },
          },
        },
      ],
    };

    // CREATE MATCH TYPE
    const postType = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$type',
          },
          regex: argsProuser.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsProuser.search && argsProuser.search !== ''
      ? matches.push(postSearch)
      : [];

    argsProuser.category && argsProuser.category !== ''
      ? matches.push(postType)
      : [];

    match = [
      {
        $and: [...matches, postSearch],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          $or: [...match],
        },
      },
    ];

    // AGGREGATE
    return await this.prouserModel.aggregate(pipeline);
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageProuser(
    flag: string,
    imageProuser: any,
    prouserID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(prouserID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageProuser, prouserID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, prouserID: Types.ObjectId) {
    const createParams = {
      filepath: 'prouser',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: prouserID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(prouserID: Types.ObjectId, type: string) {
    const removeObject = [];
    const prouserQuery = this.prouserModel.findById(prouserID);
    if (!prouserQuery || typeof prouserQuery.select !== 'function') {
      return;
    }
    const prouser = await prouserQuery.select(type).lean();
    if (!prouser) {
      return;
    }

    if (prouser && prouser[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${prouser[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && prouser[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${prouser[type].image.split(ASContainerName)[1]}`,
        });
      }
    }

    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
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
