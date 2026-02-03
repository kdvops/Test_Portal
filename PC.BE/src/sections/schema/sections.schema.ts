import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT ENUMS FOR SECTIONS
import {
  GridElementType,
  GridElementStyle,
  StyleSection,
  TypeSection,
  GridStyle,
} from '../../common/enums/sections.enums';

// IMPORT OBJECTS TYPES FOR SECTIONS
import {
  AttachmentSectionType,
  BannerSectionType,
  CardsSectionType,
  GallerySectionType,
  GridSectionType,
  ImageSectionType,
  ListSectionType,
  TableSectionType,
} from '../../common/types/sections.type';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type SectionsDocument = Sections & Document;

// ENUMS STYLES SECTIONS
registerEnumType(StyleSection, {
  name: 'StyleSection',
});

// ENUMS STYLES SECTIONS
registerEnumType(GridStyle, {
  name: 'GridStyle',
});

// ENUMS STYLES SECTIONS
registerEnumType(GridElementStyle, {
  name: 'GridElementStyle',
});

// ENUMS STYLES SECTIONS
registerEnumType(GridElementType, {
  name: 'GridElementType',
});

// ENUMS SECTIONS TYPE
registerEnumType(TypeSection, {
  name: 'TypeSection',
});

// SCHEMA TYPES SECTIONS
@Schema()
@ObjectType()
export class Sections extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String, { nullable: true })
  name: string;

  @Prop()
  @Field(() => String, { nullable: true })
  description: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => Number)
  position: number;

  @Prop({ default: StyleSection.attachmentsLarge })
  @Field(() => StyleSection)
  style: StyleSection;

  @Prop({ default: TypeSection.sectionAttachments })
  @Field(() => TypeSection)
  type: TypeSection;

  @Prop({ default: [] })
  @Field(() => [CardsSectionType], { nullable: true })
  cards: CardsSectionType[];

  @Prop({ default: null })
  @Field(() => BannerSectionType, { nullable: true })
  banner: BannerSectionType;

  @Prop({ default: null })
  @Field(() => TableSectionType, { nullable: true })
  table: TableSectionType;

  @Prop({ default: [] })
  @Field(() => [AttachmentSectionType], { nullable: true })
  attachments: AttachmentSectionType[];

  @Prop()
  @Field(() => ImageSectionType, { nullable: true })
  image: ImageSectionType;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  imageDetail: ImageDetailType;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  video: string;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  text: string;

  @Prop({ default: [] })
  @Field(() => [GridSectionType], { nullable: true })
  grids: GridSectionType[];

  @Prop()
  @Field(() => GallerySectionType, { nullable: true })
  gallery: GallerySectionType;

  @Prop()
  @Field(() => ListSectionType, { nullable: true })
  accordion: ListSectionType;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

export const SectionsSchema = SchemaFactory.createForClass(Sections);
