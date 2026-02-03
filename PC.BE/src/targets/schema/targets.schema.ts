import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

// IMPORT SCHEMA FOR SECTIONS
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';
import { SeoFieldsSchema } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type TargetsDocument = Targets & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// FEATURED GLOBAL POSITIONS
registerEnumType(GlobalPositionsFreatured, {
  name: 'GlobalPositionsFreatured',
});

@Schema()
@ObjectType()
export class Targets extends SeoFieldsSchema {
  // Identificador único
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  // Estado del target (draft, published, etc.)
  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  // Nombre visible del target (ej: "Ofertas de Verano")
  @Prop()
  @Field(() => String)
  name: string;

  // Ícono representativo
  @Prop()
  @Field(() => String)
  icon: string;

  // Color asociado (branding)
  @Prop()
  @Field(() => String)
  color: string;

  // Descripción general del target
  @Prop()
  @Field(() => String)
  description: string;

  // Posición destacada global (ej: home, sidebar, hidden)
  @Prop({ default: GlobalPositionsFreatured.hidden })
  @Field(() => GlobalPositionsFreatured)
  featured: GlobalPositionsFreatured;

  // Slug único para URL amigable
  @Prop({ default: '', unique: true })
  @Field(() => String, { nullable: true })
  slug: string;

  // Secciones asociadas
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: Sections.name })
  @Field(() => [ID])
  sections: MongooseSchema.Types.ObjectId[];

  // Mostrar posts dentro del target
  @Prop()
  @Field(() => Boolean)
  showPosts: boolean;

  // Mostrar categorías dentro del target
  @Prop()
  @Field(() => Boolean)
  showCategories: boolean;

  // Flag para deshabilitar
  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Targets' })
  @Field(() => [ID], { nullable: true })
  relatedTargets: MongooseSchema.Types.ObjectId[];

  // -------------------------
  // SYSTEM FIELDS
  // -------------------------

  @Prop({ type: Date, default: Date.now })
  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  @Field(() => Date)
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

export const TargetsSchema = SchemaFactory.createForClass(Targets);
