import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { getModelForClass } from '@typegoose/typegoose';

@Injectable()
export class UrlSvReplacerInterceptor implements NestInterceptor {
  private readonly TARGET_PARAM = '?sv=';
  private readonly NEW_SV_VALUE = process.env.AZURE_STORAGE_SAS_TOKEN;
  private readonly FILE_EXTENSIONS =
    /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|mp3|mp4|avi|mov|zip|rar)(\?|$)/i;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.processData(data)));
  }

  private processData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.processItem(item));
    }
    return this.processItem(data);
  }

  private processItem(item: any): any {
    if (item instanceof Document) {
      return this.processMongooseDocument(item);
    }
    return this.deepScan(item);
  }

  private processMongooseDocument(doc: Document): any {
    const plainData = doc.toObject({
      virtuals: false,
      getters: true,
    });

    const processedData = this.deepScan(plainData);

    try {
      const model = getModelForClass(doc.constructor as any);
      return model ? new model(processedData) : processedData;
    } catch (error) {
      return processedData;
    }
  }

  private deepScan(data: any): any {
    if (data instanceof Date) return data;

    if (data instanceof Buffer || data instanceof ObjectId) {
      return data;
    }

    if (typeof data === 'string') {
      return this.processPotentialUrl(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.deepScan(item));
    }

    if (data && typeof data === 'object') {
      return Object.keys(data).reduce(
        (acc, key) => {
          acc[key] = this.deepScan(data[key]);
          return acc;
        },
        Array.isArray(data) ? [] : {},
      );
    }
    return data;
  }

  private processPotentialUrl(value: string): string {
    if (!this.isValidTarget(value)) return value;
    const [baseUrl] = value.split(this.TARGET_PARAM);
    return `${baseUrl}?${this.NEW_SV_VALUE}`;
  }

  private isValidTarget(url: string): boolean {
    const hasExtension = this.FILE_EXTENSIONS.test(url);
    const hasParam = url.includes(this.TARGET_PARAM);
    return hasExtension && hasParam;
  }
}
