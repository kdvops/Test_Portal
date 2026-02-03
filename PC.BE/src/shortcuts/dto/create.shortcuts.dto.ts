import { Field, InputType } from "@nestjs/graphql";
import { TargetShortcut, TypeShortcut } from "src/common/enums/shortcut.enums";
import { CardShortcutInputCreate } from "src/common/types/shortcuts.type";
import { Types } from 'mongoose';

@InputType()
export class CreateShortcutsDto {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  icon: string;

  @Field(() => String, { nullable: true })
  color: string;

  @Field(() => String, { nullable: true })
  background: string;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => TypeShortcut)
  type: TypeShortcut;

  @Field(() => TargetShortcut, { nullable: true })
  target: TargetShortcut;

  @Field(() => Types.ObjectId, { nullable: true })
  targetID: Types.ObjectId;

  @Field(() => [CardShortcutInputCreate])
  cards: CardShortcutInputCreate[];
}
