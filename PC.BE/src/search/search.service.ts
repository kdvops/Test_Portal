import { Connection, Schema } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

// IMPORT OBJECT AND INPUT
import { SearchResultType } from './dto/args.search.dto';

@Injectable()
export class SearchService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // SEARCH MODULES
  async search(search: string): Promise<SearchResultType[]> {
    const models = Object.values(this.connection.models);

    const results = await Promise.all(
      models.map(async (model) => {
        const conditions = this.buildSearchConditions(model.schema, search);

        if (conditions.length === 0) return [];

        const shouldPopulateCategory = this.hasCategoryReference(model.schema);
        const shouldPopulateSeason = this.hasSeasonReference(model.schema);

        // CONSTRUIR FILTROS PARA EXCLUIR ELIMINADOS Y DRAFTS
        const filters = this.buildExclusionFilters(model.schema);

        // COMBINAR CONDICIONES DE BÚSQUEDA CON FILTROS DE EXCLUSIÓN
        const query: any =
          filters.length > 0
            ? {
                $and: [{ $or: conditions }, ...filters],
              }
            : { $or: conditions };

        const docs = await model
          .find(query)
          .populate(
            shouldPopulateCategory
              ? ['category']
              : shouldPopulateSeason
                ? ['season']
                : [],
          )
          .lean()
          .exec();

        return docs.map((doc) => ({
          _id: doc._id.toString(),
          text: this.extractMainTextField(doc),
          collection: model.collection.name,
          data: doc,
        }));
      }),
    );

    return results.flat();
  }

  private buildSearchConditions(schema: Schema, term: string): any[] {
    const conditions = [];
    schema.eachPath((path, type) => {
      if (type.instance === 'String') {
        conditions.push({ [path]: { $regex: term, $options: 'i' } });
      }
    });
    return conditions;
  }

  private extractMainTextField(doc: any): string {
    return (
      doc.title ||
      doc.name ||
      doc.description ||
      Object.values(doc).find((v) => typeof v === 'string') ||
      ''
    );
  }

  private hasCategoryReference(schema: Schema): boolean {
    const categoryPath = schema.path('category');
    if (!categoryPath) return false;

    if (
      categoryPath.instance === 'ObjectId' &&
      (categoryPath as any).options?.ref
    ) {
      return true;
    }

    if (categoryPath.instance === 'Array') {
      const arrayCaster = (categoryPath as any).caster;
      return arrayCaster?.instance === 'ObjectID' && arrayCaster?.options?.ref;
    }

    return false;
  }

  private hasSeasonReference(schema: Schema): boolean {
    const seasonPath = schema.path('season');
    if (!seasonPath) return false;

    if (
      seasonPath.instance === 'ObjectId' &&
      (seasonPath as any).options?.ref
    ) {
      return true;
    }

    if (seasonPath.instance === 'Array') {
      const arrayCaster = (seasonPath as any).caster;
      return arrayCaster?.instance === 'ObjectID' && arrayCaster?.options?.ref;
    }

    return false;
  }

  private buildExclusionFilters(schema: Schema): any[] {
    const filters: any[] = [];

    // FILTRAR ELEMENTOS ELIMINADOS (deletedAt: null)
    const deletedAtPath = schema.path('deletedAt');
    if (deletedAtPath) {
      filters.push({ deletedAt: null });
    }

    // FILTRAR ELEMENTOS EN DRAFT
    // Verificar si existe el campo 'status'
    const statusPath = schema.path('status');
    if (statusPath) {
      filters.push({ status: { $ne: 'draft' } });
    }

    // Verificar si existe el campo 'item_status' (usado en algunos modelos como Adjudicated)
    const itemStatusPath = schema.path('item_status');
    if (itemStatusPath) {
      filters.push({ item_status: { $ne: 'draft' } });
    }

    return filters;
  }
}
