import { Field, InputType } from '@nestjs/graphql';
import { OrientationPopup } from 'src/common/enums/popup.enum';

@InputType()
class ButtonPopupInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  background: string;

  @Field(() => String)
  color: string;
}

@InputType()
class PopupImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class CreatePopupDto {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => OrientationPopup)
  orientation: OrientationPopup;

  @Field(() => ButtonPopupInput, { nullable: true })
  button: ButtonPopupInput;

  @Field(() => String)
  background: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  link: string;

  @Field(() => [PopupImage], { nullable: true })
  image: PopupImage[];

  @Field(() => Boolean)
  active: boolean;
}
