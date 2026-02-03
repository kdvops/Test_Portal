export interface DialogImageDetail{  
  action: "create" | "update";
  show: boolean;
  item: ImageDetailInterface|null
  index?: number
}

export interface ImageDetailInterface{
  _id?: string
  image: string|null
  altText: string|null
  isCover?: boolean;
  updatedAt?:Date;
  deletedAt?:Date;
}