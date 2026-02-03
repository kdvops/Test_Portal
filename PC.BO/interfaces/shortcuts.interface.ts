import type { ImageDetailInterface } from "./detailed-image.interface";

export type StyleCardShortcut =
  | "cards:shortcut::small"
  | "cards:shortcut::medium"
  | "cards:shortcut::large"
  | "cardsShortcutSmall"
  | "cardsShortcutMedium"
  | "cardsShortcutLarge";

export type AlignCardShortcut =
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "align::left"
  | "align::center"
  | "align::right";

export type TypeShortcut =
  | "shortcut::tabs"
  | "shortcut::cards"
  | "shortcutTabs"
  | "shortcutCards";

export type TargetShortcut =
  | "target::home"
  | "targetHome"
  | "target::business"
  | "targetBusiness"
  | "target::enterprise"
  | "targetEnterprise"
  | "target::insurance"
  | "targetInsurance";

export interface NewPictureShortcut {
  img?: string;
  filetype?: string;
}

export interface ButtonCardShortcutInterface {
  text: string;
  color: string;
  background: string;
  link: string;
  enabled: boolean;
}

export interface TextCardShortcutInterface {
  text: string;
  color: string;
}

export interface CardShortcutInterface {
  status?: string;
  _id?: string;
  align?: AlignCardShortcut;
  title: TextCardShortcutInterface;
  description: TextCardShortcutInterface;
  style: StyleCardShortcut;
  picture?: string;
  pictureImageDetail?: ImageDetailInterface | null;
  background: string;
  button: ButtonCardShortcutInterface;
  icon: string;
  newUploadPicture?: Array<NewPictureShortcut>;
}

export interface ShortcutsGroupByTargetInterface {
  target?: TargetShortcut;
  targetID?: string;
  shortcuts: Array<ShortcutInterface>;
}

export interface ShortcutInterface {
  _id?: string;
  name: string;
  icon: string;
  color: string;
  background: string;
  type: TypeShortcut;
  target: TargetShortcut;
  targetID?: string;
  cards: Array<CardShortcutInterface>;
}
