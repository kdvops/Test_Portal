import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import { SeoPageMetaType } from 'src/common/types/seo.type';

export type SeoPageDocument = SeoPage & Document;

@Schema()
@ObjectType()
export class SeoPage extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => String)
  path: string;

  @Prop()
  @Field(() => SeoPageMetaType)
  meta: SeoPageMetaType;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const SeoPageSchema = SchemaFactory.createForClass(SeoPage);

// export type SeoGeneralDocument = SeoGeneral & Document;

// @Schema()
// @ObjectType()
// export class SeoGeneral extends Document {
//   @Field(() => ID)
//   _id: Types.ObjectId;

//   @Prop({ default: '' })
//   @Field(() => String)
//   path: string;

//   @Prop({ default: { sell: '0', buy: '0' } })
//   @Field(() => SeoGeneralType)
//   meta: SeoGeneralType;

//   @Field(() => Date)
//   @Prop({ type: Date, default: Date.now() })
//   createdAt: Date;

//   @Field(() => Date)
//   @Prop({ type: Date, default: Date.now() })
//   updatedAt: Date;

//   @Field(() => Date, { nullable: true })
//   @Prop({ type: Date, default: null })
//   deletedAt: Date;
// }

// export const SeoGeneralSchema = SchemaFactory.createForClass(SeoGeneral);
