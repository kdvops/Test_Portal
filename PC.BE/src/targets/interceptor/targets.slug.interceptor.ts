import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

// IMPORT SCHEMA
import { Targets } from '../schema/targets.schema';
import { BaseSlugInterceptor } from '../../common/interceptors/base-slug.interceptor';

@Injectable()
export class SlugTargetsInterceptor extends BaseSlugInterceptor<
  Targets & Document
> {
  constructor(
    @InjectModel(Targets.name)
    model: Model<Targets & Document>,
  ) {
    super(model, {
      slugSource: (doc) => doc.name ?? doc.title,
      logContext: 'SlugTargetsInterceptor',
    });
  }
}
