import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import {
  FeaturesInput,
  FeaturesButtonInput,
} from '../../common/types/sliders.type';

// ENUMS TARGET SLIDER
import { TargetSliders } from 'src/common/enums/target.enum';
import {
  ImageDetailInputUpdate,
  SeoFieldsInputUpdate,
} from 'src/common/types/common.type';

@InputType()
export class UpdateSliderImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdateSlider extends SeoFieldsInputUpdate {
  @Field(() => Types.ObjectId)
  _id: Types.ObjectId;

  @Field(() => FeaturesInput)
  title: FeaturesInput;

  @Field(() => FeaturesInput)
  subtitle: FeaturesInput;

  @Field(() => FeaturesInput)
  description: FeaturesInput;

  @Field(() => FeaturesButtonInput)
  button: FeaturesButtonInput;

  @Field(() => Types.ObjectId, { nullable: true })
  targetID: Types.ObjectId;

  @Field(() => TargetSliders, { nullable: true })
  target: TargetSliders;

  @Field(() => String, { nullable: true })
  picture: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail: ImageDetailInputUpdate;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  responsiveImageDetail: ImageDetailInputUpdate;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => Date, { nullable: true })
  expirationDate: Date;

  @Field(() => String, { nullable: true })
  altTextPicture: string;

  @Field(() => String, { nullable: true })
  caption: string;

  @Field(() => Number, { nullable: true })
  order: number;
}

@InputType()
export class UpdateSliderDto {
  @Field(() => Types.ObjectId)
  sliderID: Types.ObjectId;

  @Field()
  slider: UpdateSlider;

  @Field(() => [UpdateSliderImage], { nullable: true })
  newUploadPicture: UpdateSliderImage;

  @Field(() => [UpdateSliderImage], { nullable: true })
  newUploadResponsive?: UpdateSliderImage;
}
