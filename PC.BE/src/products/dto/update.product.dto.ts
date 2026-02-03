import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputUpdate,
  SectionImage,
} from '../../common/types/sections.type';

// IMPORT ENUM STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdateProduct {
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String)
  category: string;

  @Field(() => String, { nullable: true })
  banner?: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  bannerImageDetail: ImageDetailInputUpdate;
  
  @Field(() => ImageDetailInputUpdate, { nullable: true })
  thumbnailImageDetail: ImageDetailInputUpdate;
  
  @Field(() => ImageDetailInputUpdate, { nullable: true })
  responsiveImageDetail: ImageDetailInputUpdate;  

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];
}

@InputType()
export class UpdateProductDto {
  @Field(() => Types.ObjectId)
  productID: Types.ObjectId;

  @Field(() => UpdateProduct)
  product: UpdateProduct;
}
