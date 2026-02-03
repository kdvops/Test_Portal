export interface NewImagePopup {
  img?: string;
  filetype?: string;
}

export interface PopupButtonInterface {
  text: string;
  background: string;
  color: string;
}

export interface PopupInterface {
  _id?: string;
  title: string;
  excerpt: string;
  subtitle: string;
  description: string;
  orientation: "popupCenter" | "popupBottomLeft" | "popupBottomRight" |"popupBottomCenter"
  button: PopupButtonInterface;
  background: string;
  color: string;
  link: string;
  image: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
