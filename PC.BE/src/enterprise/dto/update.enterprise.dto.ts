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
export class UpdateEnterprise {
  @Field(() => String)
  title: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  link: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

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

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];
}

@InputType()
export class UpdateEnterpriseDto {
  @Field(() => Types.ObjectId)
  enterpriseID: Types.ObjectId;

  @Field(() => UpdateEnterprise)
  enterprise: UpdateEnterprise;

  @Field(() => [SectionImage])
  newUploadBanner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadThumbnail?: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadResponsive?: SectionImage[];
}
