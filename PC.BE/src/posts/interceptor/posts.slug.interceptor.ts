import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

// IMPORT SCHEMA
import { Posts } from '../schema/post.schema';
import { BaseSlugInterceptor } from '../../common/interceptors/base-slug.interceptor';

@Injectable()
export class SlugPostsInterceptor extends BaseSlugInterceptor<Posts & Document> {
  constructor(
    @InjectModel(Posts.name)
    model: Model<Posts & Document>,
  ) {
    super(model, {
      slugSource: (doc) => doc.title ?? doc.name,
      populatePaths: ['category', 'sections'],
      logContext: 'SlugPostsInterceptor',
    });
  }
}
