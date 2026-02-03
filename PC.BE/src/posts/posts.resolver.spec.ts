import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { SlugPostsInterceptor } from './interceptor/posts.slug.interceptor';
import { Posts } from './schema/post.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('PostsResolver', () => {
  let resolver: PostsResolver;
  let service: jest.Mocked<PostsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<PostsService> = {
      updatePost: jest.fn(),
      createPost: jest.fn(),
      clonePost: jest.fn(),
      changePostStatus: jest.fn(),
      removePost: jest.fn(),
      findPostsByCategory: jest.fn(),
      findPostsByCategoryId: jest.fn(),
      findPostsGroupByCategory: jest.fn(),
      findPostsByTargetId: jest.fn(),
      findPosts: jest.fn(),
      findPostById: jest.fn(),
      findPostsBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        { provide: PostsService, useValue: serviceMock },
        { provide: getModelToken(Posts.name), useValue: {} },
        {
          provide: SlugPostsInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
    service = module.get(PostsService) as jest.Mocked<PostsService>;
  });

  const makeSectionInput = (overrides: Record<string, any> = {}) => ({
    name: 'Section',
    description: 'Desc',
    color: '',
    position: 1,
    type: 'sectionCards',
    cards: [],
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
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
      category: new Types.ObjectId().toString(),
      banner: [],
      thumbnail: [],
      responsive: [],
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      sections: [makeSectionInput()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      postID: new Types.ObjectId(),
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
        category: new Types.ObjectId().toString(),
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
      ...overrides,
    }) as any;

  const makeArgs = (overrides: Record<string, any> = {}) =>
    ({
      category: '',
      search: '',
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removePost', async () => {
      await expect(resolver.removePost('not-an-id')).rejects.toThrow(
        'Invalid postID',
      );
      expect(service.removePost).not.toHaveBeenCalled();
    });

    it('rejects clonePost', async () => {
      await expect(resolver.clonePost('not-an-id')).rejects.toThrow(
        'Invalid postID',
      );
      expect(service.clonePost).not.toHaveBeenCalled();
    });

    it('rejects publishPost', () => {
      expect(() => resolver.publishPost('not-an-id')).toThrow('Invalid postID');
      expect(service.changePostStatus).not.toHaveBeenCalled();
    });

    it('rejects draftPost', () => {
      expect(() => resolver.draftPost('not-an-id')).toThrow('Invalid postID');
      expect(service.changePostStatus).not.toHaveBeenCalled();
    });

    it('rejects findPostById', () => {
      expect(() => resolver.findPostById('not-an-id')).toThrow('Invalid postID');
      expect(service.findPostById).not.toHaveBeenCalled();
    });
  });

  describe('createPost', () => {
    it('normalizes missing sections', async () => {
      service.createPost.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createPost(makeCreateDto({ sections: undefined }));

      expect(service.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createPost.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createPost(makeCreateDto());

      expect(service.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createPost(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPost).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createPost(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPost).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createPost(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPost).not.toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('normalizes missing sections', async () => {
      const dto = makeUpdateDto({
        post: { ...makeUpdateDto().post, sections: undefined },
      });
      service.updatePost.mockResolvedValueOnce({ _id: dto.postID } as any);

      await resolver.updatePost(dto);

      expect(service.updatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          post: expect.objectContaining({ sections: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updatePost.mockResolvedValueOnce({ _id: dto.postID } as any);

      await resolver.updatePost(dto);

      expect(service.updatePost).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updatePost(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updatePost).not.toHaveBeenCalled();
    });

    it('rejects extra post fields', async () => {
      const dto = makeUpdateDto({
        post: { ...makeUpdateDto().post, extra: 'bad' },
      });

      await expect(resolver.updatePost(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePost).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        post: { ...makeUpdateDto().post, status: 'available' },
      });

      await expect(resolver.updatePost(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePost).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        post: { ...makeUpdateDto().post, sections: null },
      });

      await expect(resolver.updatePost(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePost).not.toHaveBeenCalled();
    });
  });

  describe('findPosts', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findPosts(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findPosts).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findPosts(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findPosts).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findPosts.mockResolvedValueOnce([]);

      await resolver.findPosts(args);

      expect(service.findPosts).toHaveBeenCalledWith(args);
    });
  });

  describe('findPostsByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findPostsByCategory.mockResolvedValueOnce([]);

      await resolver.findPostsByCategory('category', true);

      expect(service.findPostsByCategory).toHaveBeenCalledWith('category', true);
    });
  });

  describe('findPostsByCategoryId', () => {
    it('delegates with findAll flag', async () => {
      service.findPostsByCategoryId.mockResolvedValueOnce([]);

      await resolver.findPostsByCategoryId('category', false);

      expect(service.findPostsByCategoryId).toHaveBeenCalledWith(
        'category',
        false,
      );
    });
  });

  describe('findPostsGroupByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findPostsGroupByCategory.mockResolvedValueOnce([]);

      await resolver.findPostsGroupByCategory('target', true);

      expect(service.findPostsGroupByCategory).toHaveBeenCalledWith(
        'target',
        true,
      );
    });
  });

  describe('findPostsByTargetId', () => {
    it('delegates with findAll flag', async () => {
      service.findPostsByTargetId.mockResolvedValueOnce([]);

      await resolver.findPostsByTargetId('target', true);

      expect(service.findPostsByTargetId).toHaveBeenCalledWith('target', true);
    });
  });

  describe('findUniquePostsSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniquePostsSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
