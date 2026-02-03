import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class SearchResultType {
  @Field()
  _id: string;

  @Field()
  text: string;

  @Field()
  collection: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  data: Record<string, any>;
}
