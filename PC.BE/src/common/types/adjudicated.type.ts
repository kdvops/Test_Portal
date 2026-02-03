import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@InputType()
export class AdjudicatedImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class AdjudicatedPictureInput {
  @Field(() => [AdjudicatedImage])
  image: AdjudicatedImage[];

  @Field(() => Boolean)
  isCover: boolean;
}

@InputType()
export class AdjudicatedPictureInputUpdate {
  @Field(() => String, { nullable: true })
  _id?: string;
  
  @Field(() => String)
  image: string;

  @Field(() => [AdjudicatedImage], { nullable: true })
  newImage?: AdjudicatedImage[];

  @Field(() => Boolean)
  isCover: boolean;

  @Field(() => String, { nullable: true })
  action?: string;
}

@ObjectType()
export class AdjudicatedPictureType {
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String)
  image: string;
  
  @Prop()
  @Field(() => Boolean, { defaultValue: false })
  isCover: boolean;
}