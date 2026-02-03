import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT TYPES
import { TypeLocation } from 'src/common/enums/locations.enum';
import { WorkHoursRangeType } from 'src/common/types/locations.type';

// ASSIGN SCHEMA TO DOCUMENT
export type LocationsDocument = Locations & Document;

// ENUMS TYPE LOCATIONS
registerEnumType(TypeLocation, {
  name: 'TypeLocation',
});

// SCHEMA TYPES CATEGORY
@Schema()
@ObjectType()
export class Locations extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => String)
  label: string;

  @Prop({ default: TypeLocation.locationBranches })
  @Field(() => TypeLocation)
  type: TypeLocation;

  @Prop({ default: '' })
  @Field(() => String)
  address: string;

  @Prop({ default: '' })
  @Field(() => String)
  city: string;

  @Prop({ default: '' })
  @Field(() => String)
  latitude: string;

  @Prop({ default: '' })
  @Field(() => String)
  longitude: string;

  @Prop({ default: [] })
  @Field(() => [WorkHoursRangeType])
  hours: WorkHoursRangeType[];

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

export const LocationsSchema = SchemaFactory.createForClass(Locations);
