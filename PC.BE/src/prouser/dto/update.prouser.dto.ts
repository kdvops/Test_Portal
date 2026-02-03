import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputUpdate,
  SectionImage,
} from '../../common/types/sections.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdateProuser {
  @Field(() => String)
  title: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  category: string;

  @Field(() => String, { nullable: true })
  banner: string;

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
  
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];
}

@InputType()
export class UpdateProuserDto {
  @Field(() => Types.ObjectId)
  prouserID: Types.ObjectId;

  @Field(() => UpdateProuser)
  prouser: UpdateProuser;

  @Field(() => [SectionImage])
  newUploadBanner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadThumbnail?: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadResponsive?: SectionImage[];
}
