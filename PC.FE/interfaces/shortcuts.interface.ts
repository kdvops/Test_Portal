import type { ImageDetailInterface } from "./detailed-image.interface";

export type StyleCardShortcut =
  | "cards:shortcut::small"
  | "cards:shortcut::medium"
  | "cards:shortcut::large"

  | "cardsShortcutSmall"
  | "cardsShortcutMedium"
  | "cardsShortcutLarge";
export type TypeShortcut = "shortcut::tabs" | "shortcut::cards" | "shortcutTabs" | "shortcutCards";

export type TargetShortcut = "target::home" | "targetHome" | "target::business" | "targetBusiness" | "target::enterprise" | "targetEnterprise";

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
  _id: string;
  title: TextCardShortcutInterface;
  description: TextCardShortcutInterface;
  style: StyleCardShortcut;
  picture: any;  
  pictureImageDetail?: ImageDetailInterface | null;
  background: string;
  button: ButtonCardShortcutInterface;
  icon: string;
}

export interface ShortcutInterface {
  _id: string;
  name: string;
  icon: string;
  color: string;
  background: string;
  type: TypeShortcut;
  target: TargetShortcut;
  cards: Array<CardShortcutInterface>;
}
