import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Document, Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import slugify from 'slugify';

interface DocumentWithSlug extends Document {
  slug?: string;
}

interface SlugInterceptorOptions<T extends DocumentWithSlug> {
  slugSource: (doc: any) => string | undefined;
  populatePaths?: string | string[];
  logContext?: string;
}

export abstract class BaseSlugInterceptor<T extends DocumentWithSlug>
  implements NestInterceptor
{
  protected constructor(
    protected readonly model: Model<T>,
    private readonly options: SlugInterceptorOptions<T>,
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

    const slugSourceValue = this.getSlugSourceValue(doc);

    if (
      this.hasSlugInSchema() &&
      slugSourceValue &&
      !(doc as DocumentWithSlug).slug
    ) {
      const baseSlug = slugify(slugSourceValue, {
        lower: true,
        strict: true,
      });
      const uniqueSlug = await this.getUniqueSlug(baseSlug, doc._id);

      const updateQuery = this.model.findByIdAndUpdate(
        doc._id,
        { slug: uniqueSlug },
        { new: true },
      );

      if (this.options.populatePaths) {
        updateQuery.populate(this.options.populatePaths);
      }

      const updatedDoc = (await updateQuery.lean()) as DocumentWithSlug | null;

      if (updatedDoc?.slug) {
        Logger.log(
          `<----- Slug actualizado: ${updatedDoc.slug}`,
          this.options.logContext ?? this.constructor.name,
        );
      }

      return updatedDoc ?? this.asPlainObject(item);
    }

    return this.asPlainObject(item);
  }

  private asPlainObject(item: any): any {
    return item instanceof this.model ? item.toObject() : item;
  }

  private hasSlugInSchema(): boolean {
    return !!this.model?.schema?.paths?.slug;
  }

  private getSlugSourceValue(doc: any): string | undefined {
    const value = this.options.slugSource?.(doc);
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
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
