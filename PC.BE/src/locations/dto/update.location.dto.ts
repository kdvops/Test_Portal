import { Field, InputType } from '@nestjs/graphql';
import { TypeLocation } from 'src/common/enums/locations.enum';
import { WorkHoursRangeInput } from 'src/common/types/locations.type';

@InputType()
export class UpdateLocation {
  @Field(() => String)
  label: string;

  @Field(() => TypeLocation)
  type: TypeLocation;

  @Field(() => String)
  address: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  latitude: string;

  @Field(() => String)
  longitude: string;

  @Field(() => [WorkHoursRangeInput])
  hours: WorkHoursRangeInput[];
}

@InputType()
export class UpdateLocationDto {
  @Field(() => String)
  locationID: string;

  @Field(() => UpdateLocation)
  location: UpdateLocation;
}
