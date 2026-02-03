export interface DialogCreateSeoPageInterface {
  show: boolean;
  loading: boolean;
  action: "create" | "edit";
  index: number;
  seoPage: SeoPageInterface | undefined;
}

export interface SeoPageInterface {
  _id?: string;
  path: string;
  meta: SeoMetaInterface | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface SeoMetaInterface {
  title: string;
  description: string | null;
  keywords?: string;
  image?: string;
}
