import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostsService } from './posts.service';
import { Posts } from './schema/post.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { CategoriesService } from '../categories/categories.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { ASContainerName } from 'src/common/constants';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
    sort: jest.fn().mockReturnThis(),
  };
  return query;
};

const makeSectionInput = (overrides: Record<string, any> = {}) => ({
  name: 'Section',
  description: 'Desc',
  color: '',
  position: 1,
  type: 'sectionCards',
  cards: [],
  ...overrides,
});

const makeBaseCreateDto = () =>
  ({
    title: 'Title',
    status: StatusItem.draft,
    subtitle: 'Subtitle',
    slug: 'slug',
    link: '',
    excerpt: 'Excerpt',
    author: 'Author',
    publishedAt: new Date(),
    description: 'Description',
    category: makeObjectId().toString(),
    banner: [],
    thumbnail: [],
    responsive: [],
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    disabled: false,
    sections: [makeSectionInput()],
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    postID: makeObjectId(),
    post: {
      title: 'Title',
      status: StatusItem.draft,
      slug: 'slug',
      excerpt: 'Excerpt',
      link: '',
      subtitle: 'Subtitle',
      description: 'Description',
      author: 'Author',
      publishedAt: new Date(),
      category: makeObjectId().toString(),
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      sections: [makeSectionInput()],
    },
    newUploadBanner: [],
    newUploadThumbnail: [],
    newUploadResponsive: [],
  }) as any;

describe('PostsService', () => {
  let service: PostsService;
  let postModel: any;
  let sectionsService: jest.Mocked<SectionsService>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    postModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      removeSections: jest.fn(),
      cloneSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
    } as any;

    const categoriesMock: jest.Mocked<CategoriesService> = {
      findCategoriesByTargetId: jest.fn().mockResolvedValue([]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken(Posts.name), useValue: postModel },
        { provide: AzureBlobStorageService, useValue: azureService },
        { provide: SectionsService, useValue: sectionsMock },
        { provide: CategoriesService, useValue: categoriesMock },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;
    categoriesService = module.get(
      CategoriesService,
    ) as jest.Mocked<CategoriesService>;

    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('creates a post with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      postModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createPost(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = postModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      postModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createPost(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = postModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updatePost', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.post.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      postModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      postModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.postID,
      });

      await service.updatePost(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('clonePost', () => {
    it('clones images and sections into a draft copy', async () => {
      const postID = makeObjectId();
      const existingPost = {
        _id: postID,
        title: 'Original',
        banner: 'banner.png',
        responsive: 'responsive.png',
        thumbnail: 'thumbnail.png',
        bannerImageDetail: { image: 'b.png' },
        responsiveImageDetail: { image: 'r.png' },
        thumbnailImageDetail: { image: 't.png' },
        sections: [{ _id: makeObjectId() }],
      };
      jest
        .spyOn(service, 'findPostById')
        .mockResolvedValueOnce(existingPost as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      postModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.clonePost(postID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = postModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findPostById', () => {
    it('throws when post is missing', async () => {
      const postID = makeObjectId();
      postModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findPostById(postID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a post', async () => {
      const postID = makeObjectId();
      postModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: postID }),
      );

      await expect(service.findPostById(postID)).resolves.toEqual({
        _id: postID,
      });
    });
  });

  describe('findPostsGroupByCategory', () => {
    it('aggregates posts by category', async () => {
      postModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findPostsGroupByCategory('target', false);

      expect(categoriesService.findCategoriesByTargetId).toHaveBeenCalledWith(
        'target',
        false,
      );
      expect(postModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findPosts', () => {
    it('builds a search pipeline', async () => {
      postModel.aggregate.mockReturnValueOnce([]);

      await service.findPosts({ search: 'title', category: 'cat' });

      expect(postModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findPostsByCategory', () => {
    it('returns by category', async () => {
      postModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findPostsByCategory('category', false);

      expect(postModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('findPostsByCategoryId', () => {
    it('returns empty when categoryId is blank', async () => {
      await expect(service.findPostsByCategoryId('', true)).resolves.toEqual([]);
    });

    it('returns by category id', async () => {
      postModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findPostsByCategoryId('category', false);

      expect(postModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category', deletedAt: null }),
      );
    });
  });

  describe('findPostsByTargetId', () => {
    it('returns by target id', async () => {
      postModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findPostsByTargetId('target', false);

      expect(postModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ targetID: 'target' }),
      );
    });
  });

  describe('changePostStatus', () => {
    it('updates status field', async () => {
      const postID = makeObjectId();
      postModel.findOneAndUpdate.mockResolvedValueOnce({ _id: postID });

      await service.changePostStatus(postID, 'publish');

      expect(postModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: postID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removePost', () => {
    it('soft deletes post', async () => {
      const postID = makeObjectId();
      postModel.findOneAndUpdate.mockResolvedValueOnce({ _id: postID });

      await service.removePost(postID);

      const payload = postModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeFiles', () => {
    it('removes image detail when present', async () => {
      const postID = makeObjectId();
      const imageUrl = `${ASContainerName}post/banner.png`;
      postModel.findById.mockReturnValueOnce(
        makeQueryMock({ bannerImageDetail: { image: imageUrl } }),
      );

      await service.removeFiles(postID, 'bannerImageDetail');

      expect(azureService.remove).toHaveBeenCalledWith([
        { Key: imageUrl },
      ]);
    });

    it('skips removal when missing file', async () => {
      const postID = makeObjectId();
      postModel.findById.mockReturnValueOnce(makeQueryMock({}));

      await service.removeFiles(postID, 'bannerImageDetail');

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
