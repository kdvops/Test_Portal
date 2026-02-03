import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

// IMPORT RXJS
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// IMPORT SLUGIFY
import slugify from 'slugify';

// IMPORT SCHEMA
import { Channels } from '../schema/channels.schema';

@Injectable()
export class SlugChannelsInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(Channels.name)
    private readonly model: Model<Channels & Document>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap((data) => {
        if (Array.isArray(data)) {
          return from(Promise.all(data.map((item) => this.processItem(item))));
        }
        return from(this.processItem(data));
      }),
    );
  }

  private async processItem(item: any): Promise<any> {
    // Si el item es null o undefined, retornarlo sin procesar
    if (item === null || item === undefined) {
      return item;
    }

    const doc = item instanceof this.model ? item : this.model.hydrate(item);

    if (
      this.hasSlugInSchema(this.model.schema) &&
      this.hasNameOrTitle(doc) &&
      !doc.slug
    ) {
      const baseSlug = slugify(doc.title, {
        lower: true,
        strict: true,
      });
      const uniqueSlug = await this.getUniqueSlug(baseSlug, doc._id);

      const updatedDoc = await this.model
        .findByIdAndUpdate(doc._id, { slug: uniqueSlug }, { new: true })
        .populate(['category', 'sections'])
        .lean();

      Logger.log('<----- Slug actualizado', updatedDoc.slug);

      return updatedDoc;
    }

    return item instanceof this.model
      ? item.toObject({ virtuals: false, getters: true })
      : item;
  }

  private hasSlugInSchema(schema: any): boolean {
    return !!schema?.paths?.slug;
  }

  private hasNameOrTitle(doc: any): boolean {
    return doc.name?.trim() || doc.title?.trim();
  }

  private async getUniqueSlug(baseSlug: string, id: any): Promise<string> {
    let candidate = baseSlug;
    let counter = 0;
    while (true) {
      const existing = await this.model
        .findOne({
          slug: candidate,
          _id: { $ne: id },
        })
        .lean();
      if (!existing) break;
      candidate = `${baseSlug}-${++counter}`;
    }
    return candidate;
  }
}
