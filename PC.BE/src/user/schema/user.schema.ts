import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT ROLES USER
import { RolesUser } from '../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema()
@ObjectType()
export class User extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  firstName: string;

  @Prop()
  @Field(() => String)
  lastName: string;

  @Prop()
  @Field(() => String)
  email: string;

  @Prop()
  @Field(() => String)
  displayName: string;

  @Prop({ default: '' })
  @Field(() => String)
  avatar: string;

  @Prop({ default: '' })
  @Field(() => String)
  address: string;

  @Prop({ default: '' })
  @Field(() => String)
  country: string;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  birthday: Date;

  @Prop({ default: '' })
  @Field(() => String)
  phone: string;

  @Prop({ default: 0 })
  @Field(() => Number)
  rate: number;

  @Prop()
  @Field(() => String)
  password: string;

  @Prop({ default: [RolesUser.guest] })
  @Field(() => [String])
  roles: [RolesUser];

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

export const UserSchema = SchemaFactory.createForClass(User);
