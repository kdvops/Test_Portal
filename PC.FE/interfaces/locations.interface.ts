export type TypeLocation =
  | "locationBranches"
  | "locationAth"
  | "locationAutoBank"
  | "locationSubAgents";

export interface WorkHoursRangeType {
  day: string;
  start: string;
  end: string;
}
export interface LocationInterface {
  _id?: string;
  label: string;
  type: TypeLocation;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  hours: WorkHoursRangeType[];
}
