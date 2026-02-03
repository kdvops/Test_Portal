import type { GridElementStyle } from "~/enums/gridElementStyle.enum";
import type { GridStyle } from "~/enums/gridStyle.enum";
import type { ImageDetailInterface } from "./detailed-image.interface";

export type SectionType =
  | "sectionCards"
  | "sectionAttachments"
  | "sectionBanner"
  | "sectionText"
  | "sectionVideo"
  | "sectionTable"
  | "sectionImage"
  | "sectionGrids"
  | "sectionGallery"
  | "sectionAccordion";

export type SectionStyle =
  // STYLES SECTION CARDS
  | "cardsXSmall"
  | "cardsSmall"
  | "cardsMedium"
  | "cardsLarge"
  | "cardsXLarge"

    // STYLES SECTION CARDS
  | "gridSmall"
  | "gridMedium"
  | "gridLarge"

  // STYLES SECTION BANNER
  | "bannerMedium"
  | "bannerLarge"

  // STYLES SECTION ATTACHMENTS
  | "attachmentsMedium"
  | "attachmentsLarge"

  // STYLES SECTION TEXT
  | "textMedium"
  | "textLarge"

  // STYLES SECTION VIDEO
  | "videoMedium"
  | "videoLarge"

  // STYLES SECTION IMAGE
  | "imageSmall"
  | "imageMedium"
  | "imageLarge"
  | "imageCover"

  // STYLES SECTION TABLE
  | "tableSmall"
  | "tableLarge"
  | "tableMedium";

export type StatusType = "create" | "remove" | "update";

export interface TypeTextBannerInput {
  text: string
  color: string
}

export interface DialogCreateNewSection {
  action: "create" | "update";
  show: boolean;
  step: number;
  section: SectionTypeInterface;
}

export interface DialogCreateNewSectionAttachments {
  action: "create" | "update";
  show: boolean;
  index?: number;
  attachment: TypeAttachment;
}

export interface DialogCreateNewSectionCard {
  action: "create" | "update";
  show: boolean;
  index?: number;
  card: TypeCard;
}

export interface DialogModifyGridLayout {
  action: "create" | "update";
  show: boolean;
  index?: number;
  layout: GridLayoutInterface|null
}

export interface UploadFileItem {
  img?: string;
  file?: string;
  filetype?: string;
  filename?: string;
}

export interface ButtonBannerType {
  text: string;
  color: string;
  background: string;
  link: string;
  enabled: boolean;
}

export interface TableColumnInterface {
  name: string;
  value: string;
}

export interface TypeTable {
  headers: Array<string>
  columns: Array<TableColumnInterface[]>
}

export interface TypeAttachment {
  _id?: string;
  status?: StatusType;
  name: string;
  description: string;
  file: string;
  newUploadFileItem?: Array<UploadFileItem>;
}

export interface TypeBanner {
  status?: StatusType;
  title: TypeTextBannerInput;
  description: TypeTextBannerInput;
  background: string;
  picture?: string;
  pictureImageDetail?:ImageDetailInterface|null
  button: ButtonBannerType;
  newUploadPictureItem?: Array<UploadFileItem>;
}

export interface TypeImage {
  url: string;
  newUploadPictureItem?: Array<UploadFileItem>;
}

export interface TypeCard {
  _id?: string;
  status?: StatusType;
  name: string;
  description: string;
  picture?: string;
  pictureImageDetail?:ImageDetailInterface|null
  link: string;
  newUploadPictureItem?: Array<UploadFileItem>;
}

export interface SectionTypeInterface {
  _id?: string;
  name: string;
  description: string;
  type: SectionType;
  position: number;
  color: string;
  style: SectionStyle;
  cards: Array<TypeCard>;
  banner: TypeBanner;
  table: TypeTable;
  video: string;
  image: TypeImage;
  imageDetail?:ImageDetailInterface|null
  text: string;
  attachments: Array<TypeAttachment>;
  grids?: GridInterface[];
  gallery: GalleryInterface|null;
  accordion: ListInterface|null;
}

export interface ProductsInterface {
  _id?: string;
  status?: 'draft' | 'publish';
  name: string;
  description: string;
  slug: string;
  category: string;
  banner?: string;
  responsive?: string;
  thumbnail?: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
  sections: Array<SectionTypeInterface>;
  // KEY: VALUE
  [key: string]: any;
}

export interface BusinessInterface {
  _id?: string;
  name: string;
  description: string;
  category: string;
  banner: string;
  sections: Array<SectionTypeInterface>;
  // KEY: VALUE
  [key: string]: any;
}

export interface GridInterface {
  _id?: string,
  rowHeight: number,
  rows: number, 
  columns: number,
  layouts: GridLayoutInterface[]
  badge?: string
  color?: string
  border?:string
  style?: GridStyle[]
  status?:string
  cardStyle?: SectionStyle|null
  breakLine?: boolean
}

export interface GridLayoutInterface {
  _id?:string,
  i:string, 
  x:number, 
  y:number,
  w:number, 
  h:number, 
  type:string|null,
  image?:string|null,
  imageDetail?:ImageDetailInterface|null
  button?:ButtonInterface|null,
  text?:TextInterface|null,
  style?:GridElementStyle[]
  list?:String[]
  status?:string
}

export interface ButtonInterface{
  _id?:string,
  text: string,
  href: string,
  color?: string,
  icon?: string,
  picture?: string
  iconImageDetail?:ImageDetailInterface|null
  pictureImageDetail?:ImageDetailInterface|null
}

export interface TextInterface{
  _id?: string,
  text: string,
  color?: string
}

export interface GridConfigurationInterface{ 
  position: number, 
  grid: GridInterface 
}

export interface GridElementCreationInterface{ 
  position: number, 
  element: GridLayoutInterface 
}

export interface GridElementUpdateInterface{ 
  position: number, 
  index: number, 
  element: GridLayoutInterface 
}

export interface SectionElementDeletionInterface{ 
  position: number, 
  index: number
}

export interface GalleryInterface{
  items: GalleryItemInterface[]
}

export interface GalleryItemInterface{
  _id?: string
  image: string
  icon?: string  
  imageDetail?: ImageDetailInterface|null
  iconImageDetail?: ImageDetailInterface|null
  title?: string  
  video?: string
  status?: StatusType;
}

export interface GalleryConfigurationInterface{ 
  position: number, 
  gallery: GalleryInterface 
}

export interface DialogModifyAccordionItem{  
  action: "create" | "update";
  show: boolean;
  index?: number;
  item: ListItemInterface|null
}

export interface ListInterface{
  items: ListItemInterface[]
}

export interface ListItemInterface{
  _id?: string
  content: string
  title: string
}

export interface AccordionConfigurationInterface{ 
  position: number, 
  accordion: ListInterface 
}

export interface DialogModifyAccordionItem{  
  action: "create" | "update";
  show: boolean;
  index?: number;
  item: ListItemInterface|null
}

export interface DialogModifyGalleryItem{
  action: "create" | "update";
  show: boolean;
  index?: number;
  item: GalleryItemInterface|null
}