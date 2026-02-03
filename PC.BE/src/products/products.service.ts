import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT PRODUCTS SCHEMA
import { Products, ProductsDocument } from './schema/products.schema';

// IMPORT PRODUCTS INPUT
import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { ProductsByParentTarget } from './dto/args.products.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import {
  SectionInputCreate,
  SectionInputUpdate,
  SectionType,
} from 'src/common/types/sections.type';
import { TargetParentCategories } from 'src/common/enums/target.enum';
import { UpdateSectionDto } from 'src/sections/dto/update.section.dto';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

// IMPORT MOMENT
// import * as moment from 'moment';
// import { RemoveProductsDto } from './dto/remove.product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name)
    private productModel: Model<ProductsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE PRODUCTS
  async createProducts(createProductDto: CreateProductDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createProductDto.bannerImageDetail,
      'product',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createProductDto.thumbnailImageDetail,
      'product',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createProductDto.responsiveImageDetail,
      'product',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createProductDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN PRODUCTS
    return await this.productModel.create({
      // SET ALL DATA DTO
      ...createProductDto,
      // SET ID
      _id,
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

  // REMOVE PRODUCT
  async cloneProduct(productID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingProduct = await this.findProductById(productID.toString());

    const banner = await cloneFiles(
      existingProduct.banner,
      String(_id),
      'products',
    );

    const responsive = await cloneFiles(
      existingProduct.responsive,
      String(_id),
      'products',
    );

    const thumbnail = await cloneFiles(
      existingProduct.thumbnail,
      String(_id),
      'products',
    );

    const bannerImageDetail = existingProduct.bannerImageDetail
      ? {
          ...existingProduct.bannerImageDetail,
          image: existingProduct.bannerImageDetail
            ? await cloneFiles(
                existingProduct.bannerImageDetail.image,
                String(_id),
                'product',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = existingProduct.responsiveImageDetail
      ? {
          ...existingProduct.responsiveImageDetail,
          image: existingProduct.responsiveImageDetail
            ? await cloneFiles(
                existingProduct.responsiveImageDetail.image,
                String(_id),
                'product',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = existingProduct.thumbnailImageDetail
      ? {
          ...existingProduct.thumbnailImageDetail,
          image: existingProduct.thumbnailImageDetail
            ? await cloneFiles(
                existingProduct.thumbnailImageDetail.image,
                String(_id),
                'product',
              )
            : null,
        }
      : null;

    const category = existingProduct.category?._id
      ? existingProduct.category._id
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingProduct.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN BUSINESS
    return await this.productModel.create({
      ...existingProduct,
      name: existingProduct.name + ' (copia)',
      _id,
      category,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingProduct, this.productModel),
      status: 'draft',
    });
  }

  async changeProductStatus(
    productID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.productModel.findOneAndUpdate(
      { _id: productID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE PRODUCT
  async removeProduct(productID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.productModel.findOneAndUpdate(
      { _id: productID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // UPDATE PRODUCTS
  async updateProduct(updateProductDto: UpdateProductDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateProductDto.productID,
      updateProductDto.product.banner,
      updateProductDto.product.bannerImageDetail,
      'product',
      async () =>
        await this.removeFiles(updateProductDto.productID, 'bannerImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateProductDto.productID,
      updateProductDto.product.thumbnail,
      updateProductDto.product.thumbnailImageDetail,
      'product',
      async () =>
        await this.removeFiles(
          updateProductDto.productID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateProductDto.productID,
      updateProductDto.product.responsive,
      updateProductDto.product.responsiveImageDetail,
      'product',
      async () =>
        await this.removeFiles(
          updateProductDto.productID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL PRODUCT SECTIONS
    const sectionOriginalProduct: { sections: SectionType[] } =
      (await this.productModel
        .findById(updateProductDto.productID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalProduct.sections,
      updateProductDto.product.sections,
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
      updateProductDto.product.sections.map(
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

    return await this.productModel.findOneAndUpdate(
      { _id: updateProductDto.productID },
      {
        $set: updateProductDto.product,
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

  // CREATE PRODUCTS
  async findProductsByParentTargetCategory(
    parentTarget: TargetParentCategories,
    findAll: boolean = false,
  ): Promise<ProductsByParentTarget[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // CREATE PIPELINE
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          ...(status ?? {}),
        },
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
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sections',
        },
      },
      {
        $unwind: {
          path: '$sections',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$_id',
          product: {
            $first: {
              name: '$name',
              description: '$description',
              slug: '$slug',
              banner: '$banner',
              thumbnail: '$thumbnail',
              responsive: '$responsive',
              bannerImageDetail: '$bannerImageDetail',
              responsiveImageDetail: '$responsiveImageDetail',
              thumbnailImageDetail: '$thumbnailImageDetail',
              link: '$link',
              disabled: '$disabled',
              status: '$status',
            },
          },
          sections: {
            $push: {
              _id: '$sections._id',
              name: '$sections.name',
              description: '$sections.description',
              slug: '$slug',
              type: '$sections.type',
              style: '$sections.style',
              position: '$sections.position',
              color: '$sections.color',
              cards: '$sections.cards',
              text: '$sections.text',
              image: '$sections.image',
              video: '$sections.video',
              attachments: '$sections.attachments',
              banner: '$sections.banner',
              bannerImageDetail: '$sections.bannerImageDetail',
            },
          },
          category: {
            $first: {
              _id: '$category._id',
              parentTarget: '$category.parentTarget',
              name: '$category.name',
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          name: '$product.name',
          description: '$product.description',
          slug: '$product.slug',
          banner: '$product.banner',
          thumbnail: '$product.thumbnail',
          responsive: '$product.responsive',
          bannerImageDetail: '$product.bannerImageDetail',
          responsiveImageDetail: '$product.responsiveImageDetail',
          thumbnailImageDetail: '$product.thumbnailImageDetail',
          link: '$product.link',
          disabled: '$product.disabled',
          sections: 1,
          category: 1,
          status: '$product.status',
        },
      },
      {
        $match: {
          'category.parentTarget': parentTarget,
          deletedAt: null,
        },
      },
    ];

    // RETURN PRODUCTS
    return await this.productModel.aggregate(pipeline).exec();
  }

  // CREATE PRODUCTS
  async findProductsByCategory(
    categoryID: string,
    findAll: boolean = false,
  ): Promise<Products[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.productModel
      .find({
        category: categoryID,
        deletedAt: null,
        ...(status ?? {}),
      })
      .lean()) as unknown as Products[];
  }

  // FIND PRODUCT BY ID
  async findProductById(productID: string): Promise<ProductsByParentTarget> {
    let product: ProductsByParentTarget | null = null;

    // Convertir el ID a ObjectId si es válido
    if (Types.ObjectId.isValid(productID)) {
      const objectId = new Types.ObjectId(productID);

      // Usar findOne con ObjectId para asegurar que funcione correctamente con populate
      product = (await this.productModel
        .findOne({ _id: objectId })
        .populate('category')
        .populate('sections')
        .lean()) as unknown as ProductsByParentTarget;
    }

    // Si no se encontró por ID, intentar buscar por slug
    if (!product) {
      product = (await this.productModel
        .findOne({ slug: productID, deletedAt: null })
        .populate('category')
        .populate('sections')
        .lean()) as unknown as ProductsByParentTarget;
    }

    // Si tampoco se encontró por slug, lanzar error
    if (!product) {
      throw new NotFoundException(
        `Producto con ID o slug "${productID}" no encontrado`,
      );
    }

    return product;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.productModel);
  }

  // FIND PRODUCT BY SLUG
  async findProductBySlug(slug: string): Promise<ProductsByParentTarget> {
    return (await this.productModel
      .findOne({ slug })
      .populate(['category', 'sections'])
      .lean()) as unknown as ProductsByParentTarget;
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageProduct(
    flag: string,
    imageProduct: any,
    productID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(productID, target));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageProduct, productID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, productID: Types.ObjectId) {
    const createParams = {
      filepath: 'products',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: productID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(productID: Types.ObjectId, type: string) {
    const removeObject = [];
    const productQuery = this.productModel.findById(productID);
    if (!productQuery || typeof productQuery.select !== 'function') {
      return;
    }
    const product = await productQuery.select(type).lean();
    if (!product) {
      return;
    }

    if (product && product[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${product[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && product[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${product[type].image.split(ASContainerName)[1]}`,
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
