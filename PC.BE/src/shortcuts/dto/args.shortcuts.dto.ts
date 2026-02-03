import { Field, ObjectType } from '@nestjs/graphql';
import { Shortcuts } from '../schema/shortcuts.schema';

@ObjectType()
export class ShortcutsGroupByTarget {
  @Field(() => String, { nullable: true })
  target: string;

  @Field(() => [Shortcuts])
  shortcuts: Shortcuts[];
}
