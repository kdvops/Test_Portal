import { Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT CATEGORY SCHEMA
import { Categories, CategoriesDocument } from './schema/categories.schema';

// IMPORT CATEGORY INPUT
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import {
  ParentAndTargetDto,
  CategoriesByParent,
  CategoriesAndSubcategories,
} from './dto/args.category.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { TargetCategories } from 'src/common/enums/target.enum';
import { cloneFiles } from 'src/common/utils/fileHandler';
import {
  getUniqueSlug,
  getUniqueExistingSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';
import { getUploadedImageUrl, isBase64 } from 'src/common/utils/imageManager';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(
    @InjectModel(Categories.name)
    private categoryModel: Model<CategoriesDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  async getImageUrl(source, categoryID, type, flag) {
    const url =
      (await isBase64(source)) === true
        ? await getUploadedImageUrl(
            'categories',
            async () => await this.removeFiles(categoryID, type),
            flag,
            source,
            categoryID,
          )
        : (source ?? null);
    return url;
  }
  async getImageDetail(
    _id: Types.ObjectId,
    image: string,
    imageDetail: ImageDetailInputUpdate,
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
  // UPDATE CATEGORY
  async updateCategories(
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await this.getImageDetail(
      updateCategoryDto._id,
      updateCategoryDto.pictures.banner,
      updateCategoryDto.pictures.bannerImageDetail,
      'bannerImageDetail',
    );

    const responsiveImageDetail = await this.getImageDetail(
      updateCategoryDto._id,
      updateCategoryDto.pictures.responsive,
      updateCategoryDto.pictures.responsiveImageDetail,
      'responsiveImageDetail',
    );

    const thumbnailImageDetail = await this.getImageDetail(
      updateCategoryDto._id,
      updateCategoryDto.pictures.thumbnail,
      updateCategoryDto.pictures.thumbnailImageDetail,
      'thumbnailImageDetail',
    );

    // RETURN CATEGORY
    return await this.categoryModel.findOneAndUpdate(
      { _id: updateCategoryDto._id },
      {
        $set: updateCategoryDto,
        pictures: {
          banner: null,
          responsive: null,
          thumbnail: null,
          bannerImageDetail,
          responsiveImageDetail,
          thumbnailImageDetail,
        },
        updatedAt,
      },
      { new: true },
    );
  }

  async cloneCategories(categoryID: Types.ObjectId): Promise<Categories> {
    const existingCategory = await this.findCategoryById(categoryID);
    // CREATE ID CATEGORY
    const _id: any = new Types.ObjectId();

    const banner = await cloneFiles(
      existingCategory.pictures.banner,
      String(_id),
      'categories',
    );

    const responsive = await cloneFiles(
      existingCategory.pictures.responsive,
      String(_id),
      'categories',
    );

    const thumbnail = await cloneFiles(
      existingCategory.pictures.thumbnail,
      String(_id),
      'categories',
    );

    const bannerImageDetail = existingCategory.pictures.bannerImageDetail
      ? {
          ...existingCategory.pictures.bannerImageDetail,
          image: existingCategory.pictures.bannerImageDetail.image
            ? await cloneFiles(
                existingCategory.pictures.bannerImageDetail.image,
                String(_id),
                'categories',
              )
            : null,
        }
      : null;

    const responsiveImageDetail = existingCategory.pictures
      .responsiveImageDetail
      ? {
          ...existingCategory.pictures.responsiveImageDetail,
          image: existingCategory.pictures.responsiveImageDetail.image
            ? await cloneFiles(
                existingCategory.pictures.responsiveImageDetail.image,
                String(_id),
                'categories',
              )
            : null,
        }
      : null;

    const thumbnailImageDetail = existingCategory.pictures.thumbnailImageDetail
      ? {
          ...existingCategory.pictures.thumbnailImageDetail,
          image: existingCategory.pictures.thumbnailImageDetail.image
            ? await cloneFiles(
                existingCategory.pictures.thumbnailImageDetail.image,
                String(_id),
                'categories',
              )
            : null,
        }
      : null;

    // RETURN CATEGORY
    return await this.categoryModel.create({
      // SET ALL DATA DTO
      ...existingCategory,
      name: existingCategory.name + ' (copia)',
      // SET ID
      _id,

      // SET PICTURE UPLOAD
      pictures: {
        banner: banner,
        responsive: responsive,
        thumbnail: thumbnail,
        bannerImageDetail,
        responsiveImageDetail,
        thumbnailImageDetail,
      },

      // EMPTY SLUG
      slug: await getUniqueSlug(existingCategory, this.categoryModel),
      status: 'draft',
    });
  }

  // CREATE CATEGORY
  async createCategories(
    createCategoriesDto: CreateCategoryDto,
  ): Promise<Categories> {
    // CREATE ID CATEGORY
    const _id: any = new Types.ObjectId();

    // VALIDATE TARGET LOGIC
    this.validateTargetLogic(createCategoriesDto);

    const bannerImageDetail = await this.getImageDetail(
      _id,
      createCategoriesDto.pictures.banner,
      createCategoriesDto.pictures.bannerImageDetail,
      'bannerImageDetail',
      'create',
    );

    const responsiveImageDetail = await this.getImageDetail(
      _id,
      createCategoriesDto.pictures.responsive,
      createCategoriesDto.pictures.responsiveImageDetail,
      'responsiveImageDetail',
      'create',
    );

    const thumbnailImageDetail = await this.getImageDetail(
      _id,
      createCategoriesDto.pictures.thumbnail,
      createCategoriesDto.pictures.thumbnailImageDetail,
      'thumbnailImageDetail',
      'create',
    );

    // RETURN CATEGORY
    return await this.categoryModel.create({
      // SET ALL DATA DTO
      ...createCategoriesDto,

      // SET ID
      _id,

      // SET PICTURE UPLOAD
      pictures: {
        bannerImageDetail,
        responsiveImageDetail,
        thumbnailImageDetail,
      },
    });
  }

  // GET CATEGORY BY ID
  async findCategoryById(
    categoryID: Types.ObjectId,
  ): Promise<CategoriesAndSubcategories> {
    // GET CATEGORY BY ID
    const category = await this.categoryModel.findById(categoryID).lean();

    // GET SUBCATEGORIES BY PARENT ID
    const findSubcategories = await this.categoryModel
      .find({
        parentID: categoryID,
        deletedAt: null,
        target: category.target,
      })
      .lean();

    // SET SUBCATEGORIES
    const subcategories: Categories[] = findSubcategories.map(
      (subcategory: any) => ({
        ...subcategory,
        parentID: String(subcategory.parentID),
      }),
    ) as Categories[];

    // SET CATEGORY BY ID FINAL
    const categoryByIdFinal: CategoriesAndSubcategories = {
      ...category,
      parentID: category.parentID ? String(category.parentID) : null,
      subcategories,
    } as unknown as CategoriesAndSubcategories;

    // RETURN CATEGORY BY ID FINAL
    return categoryByIdFinal;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.categoryModel);
  }

  async findCategoryBySlug(slug: string): Promise<CategoriesAndSubcategories> {
    // GET CATEGORY BY ID
    const category = await this.categoryModel.findOne({ slug }).lean();

    const categoryID = category._id;
    // GET SUBCATEGORIES BY PARENT ID
    const findSubcategories = await this.categoryModel
      .find({
        parentID: new Types.ObjectId(String(categoryID)),
        deletedAt: null,
        target: category.target,
      })
      .exec();

    // SET SUBCATEGORIES
    const subcategories: Categories[] = findSubcategories.map(
      (subcategory: any) => ({
        ...subcategory,
        parentID: String(subcategory.parentID),
      }),
    ) as Categories[];

    // SET CATEGORY BY ID FINAL
    const categoryByIdFinal: CategoriesAndSubcategories = {
      ...category,
      parentID: category.parentID ? String(category.parentID) : null,
      subcategories,
    } as unknown as CategoriesAndSubcategories;

    // RETURN CATEGORY BY ID FINAL
    return categoryByIdFinal;
  }

  // GET CATEGORY BY TARGET
  async findCategoriesByTarget(
    target: string,
    findAll: boolean = false,
  ): Promise<CategoriesAndSubcategories[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // CREATE PIPELINE MATCH PROMOTIONS RANGE
    const pipeline = [
      {
        $match: {
          target,
          deletedAt: null,
          ...(status ?? {}),
        },
      },
    ];

    // AGGREGATE
    const categories = await this.categoryModel.aggregate(pipeline).exec();

    // GET NESTED CHILDREN
    const categoriesAndNestedChildren = this.getNestedChildren(
      categories,
      null,
    );

    // RETURN CATEGORIES AND NESTED CHILDREN
    return categoriesAndNestedChildren;
  }

  // GET CATEGORY BY TARGET ID
  async findCategoriesByTargetId(
    targetID: string,
    findAll: boolean = false,
  ): Promise<CategoriesAndSubcategories[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // CREATE PIPELINE MATCH PROMOTIONS RANGE
    const pipeline = [
      {
        $match: {
          ...(status ?? {}),
          targetID: new Types.ObjectId(String(targetID)),
          deletedAt: null,
        },
      },
    ];

    // AGGREGATE
    const categories = await this.categoryModel.aggregate(pipeline).exec();

    // GET NESTED CHILDREN
    const categoriesAndNestedChildren = this.getNestedChildren(
      categories,
      null,
    );

    // RETURN CATEGORIES AND NESTED CHILDREN
    return categoriesAndNestedChildren;
  }

  // GET CATEGORY BY TARGET
  async findCategoryByParentAndTarget(
    parentAndTargetDto: ParentAndTargetDto,
    findAll: boolean = false,
  ): Promise<Categories[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };

    // CREATE PIPELINE MATCH PROMOTIONS RANGE
    const pipeline = [
      parentAndTargetDto.parentTarget
        ? {
            $match: {
              target: parentAndTargetDto.target,
              parentTarget: parentAndTargetDto.parentTarget,
              deletedAt: null,
              ...(status ?? {}),
            },
          }
        : {
            $match: {
              target: parentAndTargetDto.target,
              deletedAt: null,
              ...(status ?? {}),
            },
          },
    ];

    const categories = await this.categoryModel.aggregate(pipeline).exec();

    // AGGREGATE
    return categories;
  }

  // GET CATEGORIES BY PARENT
  async findCategoriesByParents(
    parentTarget: TargetCategories,
  ): Promise<CategoriesByParent[]> {
    // PIPELINE AGGREGATE
    const pipeline = [
      {
        $match: { deletedAt: null, target: parentTarget },
      },
      {
        $group: {
          _id: '$parentTarget',
          parent: { $first: '$parentTarget' },
          subcategories: {
            $push: {
              _id: '$_id',
              name: '$name',
              slug: '$slug',
              parentID: '$parentID',
              parentTarget: '$parentTarget',
              excerpt: '$excerpt',
              description: '$description',
              tags: '$tags',
              pictures: '$pictures',
              disabled: '$disabled',
              status: '$status',
              target: '$target',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          parent: 1,
          subcategories: 1,
        },
      },
    ];

    return await this.categoryModel.aggregate(pipeline).exec();
  }

  async changeCategoryStatus(
    categoryID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<Categories> {
    // RETURN CATEGORY
    return await this.categoryModel.findOneAndUpdate(
      { _id: categoryID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE CATEGORY BY ID
  async removeCategories(categoryID: Types.ObjectId): Promise<Categories> {
    // REMOVE IMAGE
    await this.removeFiles(categoryID, 'banner');
    await this.removeFiles(categoryID, 'responsive');
    await this.removeFiles(categoryID, 'thumbnail');

    // REMOVE CATEGORY DATE
    const deletedAt: Date = new Date();

    // SET EMPTY STRING TO PICTURES
    const pictures = {
      banner: '',
      responsive: '',
      thumbnail: '',
    };

    // RETURN CATEGORY
    return await this.categoryModel.findOneAndUpdate(
      { _id: categoryID },
      { $set: { deletedAt, pictures } },
      { new: true },
    );
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageCategory(
    flag: string,
    imageCategory: any,
    categoryID: Types.ObjectId,
    type: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(categoryID, type));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageCategory, categoryID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, categoryID: Types.ObjectId) {
    const createParams = {
      filepath: 'categories',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: categoryID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(categoryID: Types.ObjectId, type: string) {
    const removeObject = [];
    const query = this.categoryModel.findById(categoryID);
    if (!query) {
      return await this.azureBlobStorageService.remove(removeObject);
    }

    const category = await query.select('pictures').lean();
    if (!category?.pictures) {
      return await this.azureBlobStorageService.remove(removeObject);
    }

    if (!type.includes('ImageDetail')) {
      const imagePath = category.pictures[type];
      if (!imagePath) {
        return await this.azureBlobStorageService.remove(removeObject);
      }
      removeObject.push({
        Key: `${ASContainerName}${imagePath.split(ASContainerName)[1]}`,
      });
    } else if (type.includes('ImageDetail') && category.pictures[type]?.image) {
      removeObject.push({
        Key: `${ASContainerName}${category.pictures[type].image.split(ASContainerName)[1]}`,
      });
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }

  getNestedChildren(
    categories: CategoriesAndSubcategories[],
    parentID: any,
  ): CategoriesAndSubcategories[] {
    const newCategories = [];

    categories.forEach((category: any) => {
      const currentParentID = category.parentID && String(category.parentID);
      const findParentID = parentID && String(parentID);

      if (currentParentID == findParentID) {
        const categoryID = category._id && String(category._id);

        const children = this.getNestedChildren(categories, categoryID);

        if (children.length > 0) {
          category.subcategories = children;
        }

        newCategories.push(category);
      }
    });

    return newCategories;
  }

  // VALIDATE TARGET LOGIC
  private validateTargetLogic(createCategoriesDto: CreateCategoryDto): void {
    const hasTargetID =
      createCategoriesDto.targetID !== undefined &&
      createCategoriesDto.targetID !== null;
    const hasTarget =
      createCategoriesDto.target && createCategoriesDto.target.trim() !== '';

    // Validación 1: Debe tener al menos uno de los dos campos
    if (!hasTargetID && !hasTarget) {
      throw new Error(
        'La categoría debe tener un target (estático) o targetID (dinámico) definido',
      );
    }

    // Validación 2: Si tiene targetID, debe ser un ID válido de MongoDB
    if (hasTargetID) {
      if (!Types.ObjectId.isValid(createCategoriesDto.targetID)) {
        throw new Error('El targetID debe ser un ID válido de MongoDB');
      }
      console.log(
        `✅ Categoría creada con TARGET DINÁMICO (targetID: ${createCategoriesDto.targetID})`,
      );
    }

    // Validación 3: Si tiene target, debe ser un valor válido del enum
    if (hasTarget) {
      const validTargets = Object.values(TargetCategories);
      if (!validTargets.includes(createCategoriesDto.target)) {
        throw new Error(
          `El target debe ser uno de los valores válidos: ${validTargets.join(', ')}`,
        );
      }
      console.log(
        `✅ Categoría creada con TARGET ESTÁTICO (target: ${createCategoriesDto.target})`,
      );
    }

    // Validación 4: No puede tener ambos campos al mismo tiempo
    if (hasTargetID && hasTarget) {
      throw new Error(
        'La categoría no puede tener targetID y target al mismo tiempo. Use targetID para targets dinámicos o target para targets estáticos',
      );
    }
  }

  /**
   * GET TARGET TYPE
   * Determina si una categoría apunta a un target estático o dinámico
   */
  getTargetType(category: Categories): 'static' | 'dynamic' {
    return category.targetID ? 'dynamic' : 'static';
  }

  /**
   * GET TARGET INFO
   * Obtiene información sobre el tipo de target de una categoría
   */
  getTargetInfo(category: Categories): {
    type: 'static' | 'dynamic';
    target: string;
    description: string;
  } {
    if (category.targetID) {
      return {
        type: 'dynamic',
        target: category.targetID.toString(),
        description: 'Categoría vinculada a un target/sección dinámico',
      };
    } else {
      return {
        type: 'static',
        target: category.target,
        description: 'Categoría vinculada a un target/sección estático',
      };
    }
  }
}
