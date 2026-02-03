import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

// IMPORT OBJECTS TYPES FEATURES
import {
  StyleSection,
  TypeSection,
  GridElementStyle,
  GridElementType,
  GridStyle,
} from '../enums/sections.enums';
import {
  ImageDetailInput,
  ImageDetailInputUpdate,
  ImageDetailType,
} from './common.type';

///////////////////
// OBJECTS TYPES //
///////////////////

@InputType()
export class TextBannerSectionInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  color: string;
}

@InputType()
export class SectionImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class ButtonComponent {
  @Prop()
  @Field(() => String, { nullable: true })
  text: string;

  @Prop()
  @Field(() => String, { nullable: true })
  color: string;

  @Prop()
  @Field(() => String, { nullable: true })
  href: string;

  @Prop()
  @Field(() => String, { nullable: true })
  icon: string;

  @Prop()
  @Field(() => String, { nullable: true })
  picture: string;

  @Prop()
  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail?: ImageDetailInput;

  @Prop()
  @Field(() => ImageDetailInput, { nullable: true })
  iconImageDetail?: ImageDetailInput;
}

@InputType()
export class TextComponent {
  @Prop()
  @Field(() => String, { nullable: true })
  text: string;

  @Prop()
  @Field(() => String, { nullable: true })
  color: string;
}

@InputType()
export class SectionFile {
  @Field(() => String)
  file?: string;

  @Field(() => String)
  filename?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class ButtonBannerSectionInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  link: string;

  @Field(() => String)
  background: string;

  @Field(() => Boolean)
  enabled: boolean;
}

@InputType()
export class CardsSectionInputCreate {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail?: ImageDetailInput;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class CardsSectionInputUpdate {
  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail?: ImageDetailInputUpdate;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class BannerSectionInputCreate {
  @Field(() => TextBannerSectionInput, { nullable: true })
  title?: TextBannerSectionInput;

  @Field(() => TextBannerSectionInput, { nullable: true })
  description?: TextBannerSectionInput;

  @Field(() => String, { nullable: true })
  background?: string;

  @Field(() => ButtonBannerSectionInput)
  button: ButtonBannerSectionInput;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail?: ImageDetailInput;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class BannerSectionInputUpdate {
  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => TextBannerSectionInput, { nullable: true })
  title?: TextBannerSectionInput;

  @Field(() => TextBannerSectionInput, { nullable: true })
  description?: TextBannerSectionInput;

  @Field(() => String, { nullable: true })
  background?: string;

  @Field(() => ButtonBannerSectionInput)
  button: ButtonBannerSectionInput;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail?: ImageDetailInputUpdate;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class TableColumnsSectionInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}

@InputType()
export class TableSectionInputCreate {
  @Field(() => [String])
  headers: string[];

  @Field(() => [[TableColumnsSectionInput]])
  columns: TableColumnsSectionInput[][];
}

@InputType()
export class TableSectionInputUpdate {
  @Field(() => [String])
  headers: string[];

  @Field(() => [[TableColumnsSectionInput]])
  columns: TableColumnsSectionInput[][];
}

@InputType()
export class ImageSectionInputCreate {
  @Field(() => String)
  url: string;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class LayoutInputCreateType {
  @Field(() => String, { nullable: true })
  i: string;

  @Field(() => Number, { nullable: true })
  x: number;

  @Field(() => Number, { nullable: true })
  y: number;

  @Field(() => Number, { nullable: true })
  w: number;

  @Field(() => Number, { nullable: true })
  h: number;

  @Field(() => String, { nullable: true })
  image: string;

  @Field(() => ImageDetailInput, { nullable: true })
  imageDetail?: ImageDetailInput;

  @Field(() => ButtonComponent, { nullable: true })
  button: ButtonComponent;

  @Field(() => TextComponent, { nullable: true })
  text: TextComponent;

  @Field(() => GridElementType, { nullable: true })
  type: GridElementType;

  @Field(() => [GridElementStyle], { nullable: true })
  style?: GridElementStyle[];

  @Field(() => [String], { nullable: true })
  list?: string[];
}

@InputType()
export class GridSectionInputCreate {
  @Field(() => [LayoutInputCreateType], { nullable: true })
  layouts: LayoutInputCreateType[];

  @Prop({ default: false })
  @Field(() => Boolean, { nullable: true })
  breakLine: boolean;

  @Field(() => Number)
  columns: number;

  @Field(() => Number)
  rows: number;

  @Field(() => Number, { nullable: true })
  rowHeight: number;

  @Field(() => String, { nullable: true })
  badge: string;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => String, { nullable: true })
  border?: string;

  @Prop({ default: [GridStyle.styleShadow] })
  @Field(() => [GridStyle], { nullable: true })
  style?: GridStyle[];

  @Prop({ default: StyleSection.cardsSmall })
  @Field(() => StyleSection, { nullable: true })
  cardSize?: StyleSection;
}

@InputType()
export class GalleryItemInputCreateType {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => ImageDetailInput)
  imageDetail: ImageDetailInput;

  @Field(() => ImageDetailInput, { nullable: true })
  iconImageDetail: ImageDetailInput;

  @Field(() => String, { nullable: true })
  video: string;
}

@InputType()
export class GallerySectionInputCreate {
  @Field(() => [GalleryItemInputCreateType], { nullable: true })
  items: GalleryItemInputCreateType[];
}

@InputType()
export class ListItemInputCreateType {
  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;
}

@InputType()
export class ListSectionInputCreate {
  @Field(() => [ListItemInputCreateType], { nullable: true })
  items: ListItemInputCreateType[];
}

@InputType()
export class ImageSectionInputUpdate {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String)
  url: string;

  @Field(() => [SectionImage], { nullable: true })
  newUploadPictureItem: SectionImage[];
}

@InputType()
export class LayoutInputUpdateType {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  i: string;

  @Field(() => Number, { nullable: true })
  x: number;

  @Field(() => Number, { nullable: true })
  y: number;

  @Field(() => Number, { nullable: true })
  w: number;

  @Field(() => Number, { nullable: true })
  h: number;

  @Field(() => String, { nullable: true })
  image: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  imageDetail?: ImageDetailInputUpdate;

  @Field(() => ButtonComponent, { nullable: true })
  button: ButtonComponent;

  @Field(() => TextComponent, { nullable: true })
  text: TextComponent;

  @Field(() => GridElementType, { nullable: true })
  type: GridElementType;

  @Field(() => [GridElementStyle], { nullable: true })
  style?: GridElementStyle[];

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => [String], { nullable: true })
  list?: string[];
}

@InputType()
export class GridSectionInputUpdate {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => [LayoutInputUpdateType], { nullable: true })
  layouts: LayoutInputUpdateType[];

  @Prop({ default: false })
  @Field(() => Boolean, { nullable: true })
  breakLine: boolean;

  @Field(() => Number)
  columns: number;

  @Field(() => Number)
  rows: number;

  @Field(() => Number, { nullable: true })
  rowHeight: number;

  @Field(() => String, { nullable: true })
  badge: string;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => String, { nullable: true })
  border?: string;

  @Prop({ default: [GridStyle.styleShadow] })
  @Field(() => [GridStyle], { nullable: true })
  style?: GridStyle[];

  @Prop({ default: StyleSection.cardsSmall })
  @Field(() => StyleSection, { nullable: true })
  cardSize?: StyleSection;

  @Field(() => String, { nullable: true })
  status?: string;
}

@InputType()
export class GalleryItemInputUpdateType {
  @Field(() => String, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  imageDetail: ImageDetailInputUpdate;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  iconImageDetail: ImageDetailInputUpdate;

  @Field(() => String, { nullable: true })
  video: string;

  @Field(() => String, { nullable: true })
  status?: string;
}

@InputType()
export class GallerySectionInputUpdate {
  @Field(() => [GalleryItemInputUpdateType], { nullable: true })
  items: GalleryItemInputUpdateType[];
}

@InputType()
export class ListItemInputUpdateType {
  @Field(() => String, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;
}

@InputType()
export class ListSectionInputUpdate {
  @Field(() => [ListItemInputUpdateType], { nullable: true })
  items: ListItemInputUpdateType[];
}

@InputType()
export class AttachmentSectionInputCreate {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String)
  file: string;

  @Field(() => [SectionFile], { nullable: true })
  newUploadFileItem: SectionFile[];
}

@InputType()
export class AttachmentSectionInputUpdate {
  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String)
  file: string;

  @Field(() => [SectionFile], { nullable: true })
  newUploadFileItem: SectionFile[];
}

// PRODUCTS SECTION INPUT
@InputType()
export class SectionInputCreate {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  color: string;

  @Field(() => Number)
  position: number;

  @Field(() => StyleSection, { nullable: true })
  style: StyleSection;

  @Field(() => TypeSection)
  type: TypeSection;

  @Field(() => [CardsSectionInputCreate], { nullable: true })
  cards: CardsSectionInputCreate[];

  @Field(() => BannerSectionInputCreate, { nullable: true })
  banner: BannerSectionInputCreate;

  @Field(() => TableSectionInputCreate, { nullable: true })
  table: TableSectionInputCreate;

  @Field(() => [AttachmentSectionInputCreate], { nullable: true })
  attachments: AttachmentSectionInputCreate[];

  @Field(() => String, { nullable: true })
  text: string;

  @Field(() => String, { nullable: true })
  video: string;

  @Field(() => ImageSectionInputCreate, { nullable: true })
  image?: ImageSectionInputCreate;

  @Field(() => ImageDetailInput, { nullable: true })
  imageDetail?: ImageDetailInput;

  @Field(() => [GridSectionInputCreate], { nullable: true })
  grids: GridSectionInputCreate[];

  @Field(() => GallerySectionInputUpdate, { nullable: true })
  gallery: GallerySectionInputUpdate;

  @Field(() => ListSectionInputUpdate, { nullable: true })
  accordion: ListSectionInputUpdate;
}

@InputType()
export class SectionInputUpdate {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  color: string;

  @Field(() => Number)
  position: number;

  @Field(() => StyleSection, { nullable: true })
  style: StyleSection;

  @Field(() => TypeSection)
  type: TypeSection;

  @Field(() => [CardsSectionInputUpdate], { nullable: true })
  cards: CardsSectionInputUpdate[];

  @Field(() => BannerSectionInputUpdate, { nullable: true })
  banner: BannerSectionInputUpdate;

  @Field(() => TableSectionInputUpdate, { nullable: true })
  table: TableSectionInputUpdate;

  @Field(() => [AttachmentSectionInputUpdate], { nullable: true })
  attachments: AttachmentSectionInputUpdate[];

  @Field(() => String, { nullable: true })
  text: string;

  @Field(() => String, { nullable: true })
  video: string;

  @Field(() => ImageSectionInputUpdate, { nullable: true })
  image?: ImageSectionInputUpdate;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  imageDetail?: ImageDetailInputUpdate;

  @Field(() => [GridSectionInputUpdate], { nullable: true })
  grids: GridSectionInputUpdate[];

  @Field(() => GallerySectionInputUpdate, { nullable: true })
  gallery: GallerySectionInputUpdate;

  @Field(() => ListSectionInputUpdate, { nullable: true })
  accordion: ListSectionInputUpdate;
}

///////////////////
// OBJECTS TYPES //
///////////////////

@ObjectType()
export class CardsSectionType {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  link?: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String, { nullable: true })
  picture: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail: ImageDetailType;
}

@ObjectType()
export class ButtonComponentType {
  @Prop()
  @Field(() => String, { nullable: true })
  text: string;

  @Prop()
  @Field(() => String, { nullable: true })
  href: string;

  @Prop()
  @Field(() => String, { nullable: true })
  color: string;

  @Prop()
  @Field(() => String, { nullable: true })
  icon: string;

  @Prop()
  @Field(() => String, { nullable: true })
  picture: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail?: ImageDetailType;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  iconImageDetail?: ImageDetailType;
}

@ObjectType()
export class TextComponentType {
  @Prop()
  @Field(() => String, { nullable: true })
  text: string;

  @Prop()
  @Field(() => String, { nullable: true })
  color: string;
}

@ObjectType()
export class LayoutType {
  @Prop()
  @Field(() => String, { nullable: true })
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String, { nullable: true })
  i: string;

  @Prop()
  @Field(() => Number, { nullable: true })
  x: number;

  @Prop()
  @Field(() => Number, { nullable: true })
  y: number;

  @Prop()
  @Field(() => Number, { nullable: true })
  w: number;

  @Prop()
  @Field(() => Number, { nullable: true })
  h: number;

  @Prop()
  @Field(() => String, { nullable: true })
  image: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  imageDetail?: ImageDetailType;

  @Prop()
  @Field(() => ButtonComponentType, { nullable: true })
  button: ButtonComponentType;

  @Prop()
  @Field(() => TextComponentType, { nullable: true })
  text: TextComponentType;

  @Prop()
  @Field(() => GridElementType, { nullable: true })
  type: GridElementType;

  @Prop({
    default: [GridElementStyle.sizeMedium, GridElementStyle.weightNormal],
  })
  @Field(() => [GridElementStyle], { nullable: true })
  style?: GridElementStyle[];

  @Field(() => [String], { nullable: true })
  list?: string[];
}

@ObjectType()
export class GalleryItemType {
  @Prop()
  @Field(() => String, { nullable: true })
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String, { nullable: true })
  title: string;

  @Prop()
  @Field(() => String, { nullable: true })
  image?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  icon?: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  imageDetail: ImageDetailType;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  iconImageDetail: ImageDetailType;

  @Prop()
  @Field(() => String, { nullable: true })
  video: string;
}

@ObjectType()
export class ListItemType {
  @Prop()
  @Field(() => String, { nullable: true })
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  title: string;

  @Prop()
  @Field(() => String)
  content: string;
}

@ObjectType()
export class GridSectionType {
  @Prop()
  @Field(() => String, { nullable: true })
  _id: string;

  @Prop()
  @Field(() => [LayoutType], { nullable: true })
  layouts: LayoutType[];

  @Prop({ default: false })
  @Field(() => Boolean, { nullable: true })
  breakLine: boolean;

  @Prop()
  @Field(() => Number)
  columns: number;

  @Prop()
  @Field(() => Number)
  rows: number;

  @Field(() => Number, { nullable: true })
  rowHeight: number;

  @Prop()
  @Field(() => String, { nullable: true })
  badge: string;

  @Prop()
  @Field(() => String, { nullable: true })
  color: string;

  @Prop()
  @Field(() => String, { nullable: true })
  border?: string;

  @Prop({ default: [GridStyle.styleShadow] })
  @Field(() => [GridStyle], { nullable: true })
  style?: GridStyle[];

  @Prop({ default: StyleSection.cardsSmall })
  @Field(() => StyleSection, { nullable: true })
  cardSize?: StyleSection;
}

@ObjectType()
export class GallerySectionType {
  @Prop()
  @Field(() => [GalleryItemType], { nullable: true })
  items: GalleryItemType[];
}

@ObjectType()
export class ListSectionType {
  @Prop()
  @Field(() => [ListItemType], { nullable: true })
  items: ListItemType[];
}

@ObjectType()
export class TextBannerSectionType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  color: string;
}

@ObjectType()
export class ButtonBannerSectionType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => Boolean)
  enabled: boolean;
}

@ObjectType()
export class BannerSectionType {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => TextBannerSectionType, { nullable: true })
  title?: TextBannerSectionType;

  @Prop()
  @Field(() => TextBannerSectionType, { nullable: true })
  description?: TextBannerSectionType;

  @Prop()
  @Field(() => String, { nullable: true })
  background?: string;

  @Prop()
  @Field(() => ButtonBannerSectionType)
  button: ButtonBannerSectionType;

  @Prop()
  @Field(() => String, { nullable: true })
  picture: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail: ImageDetailType;
}

@ObjectType()
export class ImageSectionType {
  @Prop()
  @Field(() => ID, { nullable: true })
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  url: string;
}

@ObjectType()
export class AttachmentSectionType {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String)
  file: string;
}

@ObjectType()
export class TableColumnsSectionType {
  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  value: string;
}

@ObjectType()
export class TableSectionType {
  @Prop()
  @Field(() => [String])
  headers: string[];

  @Prop()
  @Field(() => [[TableColumnsSectionType]])
  columns: TableColumnsSectionType[][];
}

@ObjectType()
export class SectionType {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => Number)
  position: number;

  @Prop()
  @Field(() => StyleSection, { nullable: true })
  style: StyleSection;

  @Prop()
  @Field(() => TypeSection)
  type: TypeSection;

  @Prop({ default: null })
  @Field(() => TableSectionType)
  table: TableSectionType;

  @Prop({ default: [] })
  @Field(() => [CardsSectionType])
  cards: CardsSectionType[];

  @Prop({ default: null })
  @Field(() => BannerSectionType)
  banner: BannerSectionType;

  @Prop({ default: [] })
  @Field(() => [AttachmentSectionType])
  attachments: AttachmentSectionType[];

  @Prop({ default: null })
  @Field(() => ImageSectionType, { nullable: true })
  image?: ImageSectionType;

  @Prop({ default: null })
  @Field(() => ImageDetailType, { nullable: true })
  imageDetail?: ImageDetailType;

  @Prop({ default: [] })
  @Field(() => [GridSectionType])
  grids: GridSectionType[];

  @Prop({ default: [] })
  @Field(() => GallerySectionType)
  gallery: GallerySectionType;

  @Prop({ default: null })
  @Field(() => ListSectionType)
  accordion: ListSectionType;
}
