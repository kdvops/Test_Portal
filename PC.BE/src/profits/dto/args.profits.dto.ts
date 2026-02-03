import { Field, ObjectType } from '@nestjs/graphql';

// IMPORT OBJECTS TYPES FOR PROMOTION
import { Profits } from '../schema/profits.schema';
import { Categories } from '../../categories/schema/categories.schema';

@ObjectType()
export class ProfitsGroupByCategoryDto {
  @Field(() => [Profits])
  profits: Profits[];

  @Field(() => Categories)
  category: Categories;
}
