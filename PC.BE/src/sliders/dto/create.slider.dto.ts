import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import {
  FeaturesInput,
  FeaturesButtonInput,
} from '../../common/types/sliders.type';

// ENUMS TARGET SLIDER
import { TargetSliders } from 'src/common/enums/target.enum';
import { ImageDetailInput, SeoFieldsInput } from 'src/common/types/common.type';

@InputType()
export class SliderImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class CreateSliderDto extends SeoFieldsInput {
  @Field(() => FeaturesInput)
  title: FeaturesInput;

  @Field(() => FeaturesInput)
  subtitle: FeaturesInput;

  @Field(() => FeaturesInput)
  description: FeaturesInput;

  @Field(() => FeaturesButtonInput)
  button: FeaturesButtonInput;

  @Field(() => String, { nullable: true })
  targetID: string;

  @Field(() => TargetSliders, { nullable: true })
  target: TargetSliders;

  @Field(() => String, { nullable: true })
  picture: string;

  @Field(() => String, { nullable: true })
  responsive: string;

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail: ImageDetailInput;

  @Field(() => ImageDetailInput, { nullable: true })
  responsiveImageDetail: ImageDetailInput;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => String, { nullable: true })
  altTextPicture: string;

  @Field(() => String, { nullable: true })
  caption: string;

  @Field(() => Number, { nullable: true })
  order: number;

  @Field(() => Date, { nullable: true })
  expirationDate: Date;
}
