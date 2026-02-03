import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT POSTS SCHEMA
import { Posts, PostsDocument } from './schema/post.schema';

// IMPORT POSTS INPUT
import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';
import {
  ArgsPosts,
  PostsByGroupType,
  PostsPostType,
} from './dto/args.post.dto';
import { UpdateSectionDto } from 'src/sections/dto/update.section.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import {
  SectionInputCreate,
  SectionInputUpdate,
  SectionType,
} from 'src/common/types/sections.type';
import { CategoriesService } from 'src/categories/categories.service';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName } from 'src/common/constants';
import { CategoriesAndSubcategories } from 'src/categories/dto/args.category.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name)
    private postModel: Model<PostsDocument>,
    private categoriesService: CategoriesService,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE POSTS
  async createPost(createPostDto: CreatePostDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    // SET NEW IMAGES
    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createPostDto.bannerImageDetail,
      'post',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createPostDto.thumbnailImageDetail,
      'post',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createPostDto.responsiveImageDetail,
      'post',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // CREATE SECTIONS
    const sections = await Promise.all(
      createPostDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN POSTS
    return await this.postModel.create({
      // SET ALL DATA DTO
      ...createPostDto,

      // SET ID
      _id,
      // SET PICTURE UPLOAD
      banner: null,
      // SET THUMBNAIL UPLOAD
      thumbnail: null,
      // SET RESPONSIVE UPLOAD
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,

      // SET SECTIONS
      sections,
    });
  }

  // UPDATE POSTS
  async updatePost(updatePostDto: UpdatePostDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // SET NEW IMAGES
    const bannerImageDetail = await getImageDetail(
      updatePostDto.postID,
      updatePostDto.post.banner,
      updatePostDto.post.bannerImageDetail,
      'post',
      async () =>
        await this.removeFiles(updatePostDto.postID, 'bannerImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updatePostDto.postID,
      updatePostDto.post.thumbnail,
      updatePostDto.post.thumbnailImageDetail,
      'post',
      async () =>
        await this.removeFiles(updatePostDto.postID, 'thumbnailImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updatePostDto.postID,
      updatePostDto.post.responsive,
      updatePostDto.post.responsiveImageDetail,
      'post',
      async () =>
        await this.removeFiles(updatePostDto.postID, 'responsiveImageDetail'),
    );
    // SET NEW IMAGES

    // FIND ORIGINAL POSTS SECTIONS
    const sectionOriginalPosts: { sections: SectionType[] } =
      (await this.postModel
        .findById(updatePostDto.postID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalPosts.sections,
      updatePostDto.post.sections,
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
      updatePostDto.post.sections.map(async (section: SectionInputUpdate) => {
        if (section._id) {
          const updateDto: UpdateSectionDto = {
            sectionID: section._id,
            section: section,
          };
          const sectionUpdate =
            await this.sectionsService.updateSections(updateDto);
          // RETURN SECTIONS
          return sectionUpdate._id;
        } else {
          const sectionCreate =
            await this.sectionsService.createSections(section);
          // RETURN SECTIONS
          return sectionCreate;
        }
      }),
    );
    // UPDATE SECTIONS

    return await this.postModel.findOneAndUpdate(
      { _id: updatePostDto.postID },
      {
        $set: updatePostDto.post,
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

  // CLONE POSTS
  async clonePost(postID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingPosts = await this.findPostById(postID);

    const banner = await cloneFiles(existingPosts.banner, String(_id), 'post');

    const responsive = await cloneFiles(
      existingPosts.responsive,
      String(_id),
      'post',
    );

    const thumbnail = await cloneFiles(
      existingPosts.thumbnail,
      String(_id),
      'post',
    );

    const bannerImageDetail = existingPosts.bannerImageDetail
      ? {
          ...existingPosts.bannerImageDetail,
          image: existingPosts.bannerImageDetail
            ? await cloneFiles(
                existingPosts.bannerImageDetail.image,
                String(_id),
                'post',
              )
            : null,
        }
      : null;

    const responsiveImageDetail = existingPosts.responsiveImageDetail
      ? {
          ...existingPosts.responsiveImageDetail,
          image: existingPosts.responsiveImageDetail
            ? await cloneFiles(
                existingPosts.responsiveImageDetail.image,
                String(_id),
                'post',
              )
            : null,
        }
      : null;

    const thumbnailImageDetail = existingPosts.thumbnailImageDetail
      ? {
          ...existingPosts.thumbnailImageDetail,
          image: existingPosts.thumbnailImageDetail
            ? await cloneFiles(
                existingPosts.thumbnailImageDetail.image,
                String(_id),
                'post',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingPosts.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN POSTS
    return await this.postModel.create({
      ...existingPosts,
      title: existingPosts.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveImageDetail,
      thumbnailImageDetail,
      sections,
      slug: await getUniqueSlug(existingPosts, this.postModel),
      status: 'draft',
    });
  }

  async changePostStatus(
    postID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.postModel.findOneAndUpdate(
      { _id: postID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE POSTS
  async removePost(postID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.postModel.findOneAndUpdate(
      { _id: postID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND POSTS BY TYPE
  async findPostsByCategory(
    categoryID: string,
    findAll: boolean = false,
  ): Promise<PostsPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.postModel
      .find({
        category: categoryID,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as PostsPostType[];
  }

  // FIND POSTS BY CATEGORY ID
  async findPostsByCategoryId(
    categoryId: string,
    findAll: boolean = true,
  ): Promise<PostsPostType[]> {
    // VALIDAR QUE EL CATEGORYID NO SEA VACÍO
    if (!categoryId || categoryId.trim() === '') {
      return [];
    }

    // CONSTRUIR FILTROS BASE
    // deletedAt SIEMPRE debe ser null (nunca traer elementos eliminados)
    const query: any = {
      category: categoryId,
      deletedAt: null,
    };

    // FindAll solo afecta al status:
    // - Si FindAll es false: excluir status 'trash'
    // - Si FindAll es true: incluir todos los status (publish, draft, trash)
    if (!findAll) {
      query.status = { $ne: 'trash' };
    }

    // EJECUTAR CONSULTA CON POBLADO Y ORDENAMIENTO
    return (await this.postModel
      .find(query)
      .populate(['sections', 'category', 'targetID'])
      .sort({ createdAt: -1 })
      .lean()) as unknown as PostsPostType[];
  }

  // FIND POSTS BY TARGET ID
  async findPostsByTargetId(
    targetID: string,
    findAll: boolean = false,
  ): Promise<PostsPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.postModel
      .find({
        targetID: targetID,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category', 'targetID'])
      .lean()) as unknown as PostsPostType[];
  }

  // FIND GROUP POSTS BY TARGET CATEGORIES
  async findPostsGroupByCategory(
    targetId: string,
    findAll: boolean = false,
  ): Promise<PostsByGroupType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };

    // STEP 1: GET THE CATEGORIES THAT BELONG TO THE TARGET ID
    const targetCategories =
      await this.categoriesService.findCategoriesByTargetId(targetId, false);

    // PASO 2: GET THE IDs OF THE FOUND CATEGORIES
    const categoryIds = targetCategories.map(
      (cat: CategoriesAndSubcategories) => cat._id,
    );

    // PASO 3: PIPELINE TO GROUP POSTS BY THE TARGET CATEGORIES
    const pipeline = [
      // FILTER POSTS THAT BELONG TO THE TARGET CATEGORIES
      {
        $match: {
          category: { $in: categoryIds },
          deletedAt: null,
          ...(status ?? {}),
        },
      },
      // LOOKUP WITH CATEGORIES TO GET THE COMPLETE INFORMATION
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
      // GROUP BY CATEGORY
      {
        $group: {
          _id: '$category._id',
          category: {
            $first: {
              _id: '$category._id',
              name: '$category.name',
              excerpt: '$category.excerpt',
              description: '$category.description',
              tags: '$category.tags',
              slug: '$category.slug',
            },
          },
          posts: {
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
              targetID: '$targetID',
              disabled: '$disabled',
              status: '$status',
            },
          },
        },
      },
      // PROJECT ONLY THE NEEDED FIELDS
      {
        $project: {
          _id: 0,
          category: 1,
          posts: 1,
        },
      },
    ];

    // RETURN POSTS
    return await this.postModel.aggregate(pipeline).exec();
  }

  // FIND POSTS BY ID
  async findPostById(postID: Types.ObjectId): Promise<PostsPostType> {
    const post = (await this.postModel
      .findOne({ _id: postID })
      .populate(['sections', 'category'])
      .lean()) as unknown as PostsPostType;

    if (!post) {
      throw new NotFoundException(`Post con ID ${postID} no encontrado`);
    }

    return post;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.postModel);
  }

  // FIND POSTS BY ID
  async findPostsBySlug(slug: string): Promise<PostsPostType> {
    return (await this.postModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as PostsPostType;
  }

  // FIND POSTS
  async findPosts(argsPosts: ArgsPosts): Promise<PostsPostType[]> {
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
              regex: argsPosts.search,
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
              regex: argsPosts.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$slug',
              },
              regex: argsPosts.search,
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
              regex: argsPosts.search,
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
            $toString: '$category',
          },
          regex: argsPosts.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    if (argsPosts.search?.trim()) {
      matches.push(postSearch);
    }

    if (argsPosts.category?.trim()) {
      matches.push(postType);
    }

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
    return await this.postModel.aggregate(pipeline);
  }

  // REMOVE BUCKET
  async removeFiles(postID: Types.ObjectId, type: string) {
    const removeObject = [];
    const postQuery = this.postModel.findById(postID);
    if (!postQuery || typeof postQuery.select !== 'function') {
      return;
    }
    const post = await postQuery.select(type).lean();
    if (!post) {
      return;
    }

    if (post && post[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${post[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && post[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${post[type].image.split(ASContainerName)[1]}`,
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
