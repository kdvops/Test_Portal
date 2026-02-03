import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

// IMPORT OBJECTS TYPES FEATURES
import {
  ImageDetailInput,
  ImageDetailInputUpdate,
  ImageDetailType,
} from './common.type';
import { StyleAlignShortcut, StyleCardShortcut } from '../enums/shortcut.enums';

///////////////////
// OBJECTS TYPES //
///////////////////

// ENUMS STYLES SHORTCUTS
registerEnumType(StyleCardShortcut, {
  name: 'StyleCardShortcut',
});

// ENUMS STYLES ALIGN SHORTCUTS
registerEnumType(StyleAlignShortcut, {
  name: 'StyleAlignShortcut',
});

@InputType()
export class ShortcutImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class ButtonCardShortcutInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  link: string;

  @Field(() => String)
  background: string;

  @Field(() => Boolean)
  enabled: boolean;
}

@InputType()
export class TextCardShortcutInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  color: string;
}

@InputType()
export class CardShortcutInputCreate {
  @Field(() => TextCardShortcutInput)
  title: TextCardShortcutInput;

  @Field(() => TextCardShortcutInput)
  description: TextCardShortcutInput;

  @Field(() => StyleCardShortcut)
  style: StyleCardShortcut;

  @Field(() => StyleAlignShortcut, { nullable: true })
  align: StyleAlignShortcut;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail: ImageDetailInput;

  @Field(() => String)
  background: string;

  @Field(() => ButtonCardShortcutInput)
  button: ButtonCardShortcutInput;

  @Field(() => String)
  icon: string;
}

@InputType()
export class CardShortcutInputUpdate {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => TextCardShortcutInput)
  title: TextCardShortcutInput;

  @Field(() => TextCardShortcutInput)
  description: TextCardShortcutInput;

  @Field(() => StyleCardShortcut)
  style: StyleCardShortcut;

  @Field(() => StyleAlignShortcut, { nullable: true })
  align: StyleAlignShortcut;

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail: ImageDetailInputUpdate;

  @Field(() => [ShortcutImage], { nullable: true })
  newUploadPicture: ShortcutImage[];

  @Field(() => String)
  background: string;

  @Field(() => ButtonCardShortcutInput)
  button: ButtonCardShortcutInput;

  @Field(() => String)
  icon: string;
}

///////////////////

@ObjectType()
export class ButtonCardShortcutType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => Boolean)
  enabled: boolean;
}

@ObjectType()
export class TextCardShortcutType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  color: string;
}

@ObjectType()
export class CardShortcutType {
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => TextCardShortcutType)
  title: TextCardShortcutType;

  @Prop()
  @Field(() => TextCardShortcutType)
  description: TextCardShortcutType;

  @Prop()
  @Field(() => StyleCardShortcut)
  style: StyleCardShortcut;

  @Prop({ default: StyleAlignShortcut.alignLeft })
  @Field(() => StyleAlignShortcut, { nullable: true })
  align: StyleAlignShortcut;

  @Prop()
  @Field(() => String, { nullable: true })
  picture?: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail: ImageDetailType;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => ButtonCardShortcutType)
  button: ButtonCardShortcutType;

  @Prop()
  @Field(() => String)
  icon: string;
}
