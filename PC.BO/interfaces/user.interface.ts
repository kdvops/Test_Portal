export interface UserInterface {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  banner: string;
  avatar: string;
  address?: string;
  country: string;
  birthday?: string;
  phone: string;
  rate: number;
  password?: string;
  roles: Array<string>;
  createdAt?: string;
}
