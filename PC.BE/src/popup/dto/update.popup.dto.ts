import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { OrientationPopup } from 'src/common/enums/popup.enum';

@InputType()
class ButtonPopupUpdateInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  background: string;

  @Field(() => String)
  color: string;
}

@InputType()
export class UpdatePopupImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdatePopup {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => ButtonPopupUpdateInput)
  button: ButtonPopupUpdateInput;

  @Field(() => String)
  background: string;

  @Field(() => String)
  color: string;

  @Field(() => OrientationPopup)
  orientation: OrientationPopup;

  @Field(() => String)
  link: string;

  @Field(() => String)
  image: string;

  @Field(() => Boolean)
  active: boolean;
}

@InputType()
export class UpdatePopupDto {
  @Field(() => Types.ObjectId)
  popupID: Types.ObjectId;

  @Field(() => [UpdatePopupImage], { nullable: true })
  newImagePopup: UpdatePopupImage[];

  @Field(() => UpdatePopup)
  popup: UpdatePopup;
}
