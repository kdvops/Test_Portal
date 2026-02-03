import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT ENUMS FOR SHORTCUTS
import {
  TargetShortcut,
  TypeShortcut,
} from '../../common/enums/shortcut.enums';

// IMPORT OBJECTS TYPES FOR SHORTCUTS
import { CardShortcutType } from '../../common/types/shortcuts.type';
import { Targets } from 'src/targets/schema/targets.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type ShortcutsDocument = Shortcuts & Document;

// ENUMS STYLES SHORTCUTS
registerEnumType(TypeShortcut, {
  name: 'TypeShortcut',
});

// ENUMS SHORTCUTS TARGETS
registerEnumType(TargetShortcut, {
  name: 'TargetShortcut',
});

// SCHEMA TYPES SHORTCUTS
@Schema()
@ObjectType()
export class Shortcuts extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  icon: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Prop({ default: TypeShortcut.shortcutTabs })
  @Field(() => TypeShortcut)
  type: TypeShortcut;

  @Prop({ default: TargetShortcut.targetHome })
  @Field(() => TargetShortcut, { nullable: true })
  target: TargetShortcut;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Targets.name,
    default: null,
  })
  @Field(() => ID, { nullable: true })
  targetID: MongooseSchema.Types.ObjectId;

  @Prop({ default: [] })
  @Field(() => [CardShortcutType])
  cards: CardShortcutType[];

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

export const ShortcutsSchema = SchemaFactory.createForClass(Shortcuts);
