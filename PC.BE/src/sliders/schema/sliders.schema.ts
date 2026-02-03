import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

// IMPORT OBJECTS TYPES FOR SLIDER
import {
  FeaturesType,
  FeaturesButtonType,
} from '../../common/types/sliders.type';

// IMPORT CONSTANTS DEFAULTS FEATURES SLIDER
import { defaultFeatureSlider } from '../../common/constants';

// IMPORT ENUMS SLIDER TARGETS
import { TargetSliders } from '../../common/enums/target.enum';
import { ImageDetailType, SeoFieldsSchema } from 'src/common/types/common.type';

// IMPORT SCHEMA TARGETS
import { Targets } from 'src/targets/schema/targets.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type SlidersDocument = Sliders & Document;

// ENUMS
registerEnumType(TargetSliders, {
  name: 'TargetSliders',
});

@Schema()
@ObjectType()
export class Sliders extends SeoFieldsSchema {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  // -------------------------
  // CAMPOS DE CONTENIDO
  // -------------------------

  @Prop({ default: defaultFeatureSlider.features })
  @Field(() => FeaturesType)
  title: FeaturesType;

  @Prop({ default: defaultFeatureSlider.features })
  @Field(() => FeaturesType)
  subtitle: FeaturesType;

  @Prop({ default: defaultFeatureSlider.features })
  @Field(() => FeaturesType)
  description: FeaturesType;

  @Prop({ default: defaultFeatureSlider.featuresButton })
  @Field(() => FeaturesButtonType)
  button: FeaturesButtonType;

  // Relación con Target
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Targets.name,
    default: null,
  })
  @Field(() => ID, { nullable: true })
  targetID: MongooseSchema.Types.ObjectId;

  // URL destino del banner
  @Prop({ default: '' })
  @Field(() => String)
  path: string;

  // Imagen principal del banner
  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  picture: string;

  // Imagen responsive alternativa
  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  responsive: string;

  @Prop({ default: null })
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail: ImageDetailType;

  @Prop({ default: null })
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Prop({ default: false })
  @Field(() => Boolean)
  disabled: boolean;

  // Tipo de slider (ej: bannerHome, promo, etc.)
  @Prop({ default: TargetSliders.bannerHome, nullable: true })
  @Field(() => String, { nullable: true })
  target: TargetSliders;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  altTextPicture: string;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  caption: string; // Texto breve visible bajo el banner

  @Prop()
  @Field(() => Number, { nullable: true })
  order: number; // Orden en el slider

  @Prop({ default: null })
  @Field(() => Number, { nullable: true })
  position: number; // Posición del slider

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  expirationDate: Date; // Fecha de caducidad

  // -------------------------
  // SYSTEM FIELDS
  // -------------------------

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const SlidersSchema = SchemaFactory.createForClass(Sliders);
