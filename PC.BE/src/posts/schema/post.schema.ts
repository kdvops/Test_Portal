import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

// IMPORT SCHEMA FOR CATEGORIES
import { Categories } from 'src/categories/schema/categories.schema';

// IMPORT SCHEMA FOR BUSINESS
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { Targets } from 'src/targets/schema/targets.schema';
import { ImageDetailType, SeoFieldsSchema } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type PostsDocument = Posts & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

@Schema()
@ObjectType()
export class Posts extends SeoFieldsSchema {
  // 🔑 Identificador único del post
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  // Estado del post (draft, published, archived, etc.)
  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  // Título principal visible en la página
  @Prop()
  @Field(() => String)
  title: string;

  // Slug único para la URL amigable
  @Prop({ unique: true })
  @Field(() => String)
  slug: string;

  // Autor del post (referencia a User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @Field(() => ID, { nullable: true })
  author: MongooseSchema.Types.ObjectId;

  // Fecha de publicación real (distinta de createdAt)
  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  publishedAt: Date;

  // Enlace absoluto o relativo al post
  @Prop()
  @Field(() => String)
  link: string;

  // Extracto breve del contenido (usado en listados y SEO)
  @Prop()
  @Field(() => String)
  excerpt: string;

  // Subtítulo o bajada del título
  @Prop()
  @Field(() => String)
  subtitle: string;

  // Contenido completo del artículo
  @Prop()
  @Field(() => String)
  description: string;

  // Categoría principal del post
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Categories.name })
  @Field(() => ID)
  category: MongooseSchema.Types.ObjectId;

  // Secciones adicionales a las que pertenece
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: Sections.name })
  @Field(() => [ID])
  sections: MongooseSchema.Types.ObjectId[];

  // Target o campaña asociada (opcional)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Targets.name,
    default: null,
  })
  @Field(() => ID, { nullable: true })
  targetID: MongooseSchema.Types.ObjectId;

  // Imagen principal del post (hero/banner)
  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  banner: string;

  // Miniatura para listados
  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  thumbnail: string;

  // Imagen responsive alternativa
  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  responsive: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  thumbnailImageDetail: ImageDetailType;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  // Flag para deshabilitar la publicación
  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  // Posts relacionados para enlazado interno
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Posts' })
  @Field(() => [ID], { nullable: true })
  relatedPosts: MongooseSchema.Types.ObjectId[];

  // -------------------------
  // SYSTEM FIELDS
  // -------------------------

  // Fecha de creación en base de datos
  @Prop({ type: Date, default: Date.now })
  @Field(() => Date)
  createdAt: Date;

  // Fecha de última actualización
  @Prop({ type: Date, default: Date.now })
  @Field(() => Date)
  updatedAt: Date;

  // Fecha de eliminación lógica (soft delete)
  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
